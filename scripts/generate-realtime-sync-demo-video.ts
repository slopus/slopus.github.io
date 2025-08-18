#!/usr/bin/env npx tsx

import { Command } from 'commander';
import { execSync } from 'child_process';
import * as fs from 'fs';

interface VideoInfo {
  width: number;
  height: number;
  duration: number;
  path: string;
}

function getVideoInfo(videoPath: string): VideoInfo {
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  try {
    const ffprobeCmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
    const output = execSync(ffprobeCmd, { encoding: 'utf8' });
    const data = JSON.parse(output);
    
    const videoStream = data.streams.find((s: any) => s.codec_type === 'video');
    if (!videoStream) {
      throw new Error(`No video stream found in ${videoPath}`);
    }

    return {
      width: videoStream.width,
      height: videoStream.height,
      duration: parseFloat(data.format.duration),
      path: videoPath
    };
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error('ffprobe not found. Please install ffmpeg.');
    }
    throw error;
  }
}

function validateVideos(terminal: VideoInfo, simulator: VideoInfo): void {
  // Check duration match (within 1 second tolerance)
  const durationDiff = Math.abs(terminal.duration - simulator.duration);
  if (durationDiff > 1) {
    console.warn(`⚠️  Warning: Video durations differ by ${durationDiff.toFixed(2)} seconds`);
    console.warn(`   Terminal: ${terminal.duration.toFixed(2)}s`);
    console.warn(`   Simulator: ${simulator.duration.toFixed(2)}s`);
  }

  // Simulator should be roughly portrait (taller than wide)
  const simulatorAspect = simulator.width / simulator.height;
  if (simulatorAspect > 0.7) {
    console.warn(`⚠️  Warning: Simulator video doesn't appear to be portrait orientation (${simulatorAspect.toFixed(2)})`);
  }

  console.log('✅ Video validation complete');
  console.log(`   Terminal: ${terminal.width}x${terminal.height} (${terminal.duration.toFixed(2)}s)`);
  console.log(`   Simulator: ${simulator.width}x${simulator.height} (${simulator.duration.toFixed(2)}s)`);
}

function compositeVideos(terminal: VideoInfo, simulator: VideoInfo, outputPath: string): void {
  // Container dimensions: 600px wide x 670px tall
  // Terminal: 75% of container height (502.5px), positioned top-left
  // Flexible aspect ratio: 450-550px width, 450-550px height range
  
  const containerWidth = 600;
  const containerHeight = 670;
  
  // Calculate terminal dimensions with flexible aspect ratio
  let terminalWidth: number;
  let terminalHeight: number;
  
  // Start with 75% of container height
  const targetHeight = containerHeight * 0.75; // 502.5px
  
  // Calculate what width would be at this height
  const terminalAspect = terminal.width / terminal.height;
  const widthAtTargetHeight = targetHeight * terminalAspect;
  
  // Check if dimensions fall within acceptable range (450-550px for both)
  if (widthAtTargetHeight > 600) {
    throw new Error(`Terminal video would be ${widthAtTargetHeight.toFixed(0)}px wide at 75% height (${targetHeight.toFixed(0)}px), exceeding 600px container width`);
  }
  
  if (widthAtTargetHeight > 550) {
    // Video is too wide, constrain by width
    terminalWidth = 550;
    terminalHeight = terminalWidth / terminalAspect;
    console.log(`📏 Terminal video constrained by width (550px)`);
  } else if (targetHeight > 550) {
    // Video would be too tall, constrain by height
    terminalHeight = 550;
    terminalWidth = terminalHeight * terminalAspect;
    console.log(`📏 Terminal video constrained by height (550px)`);
  } else if (widthAtTargetHeight < 450) {
    // Video is too narrow, set minimum width
    terminalWidth = 450;
    terminalHeight = terminalWidth / terminalAspect;
    console.log(`📏 Terminal video set to minimum width (450px)`);
  } else if (targetHeight < 450) {
    // Video would be too short, set minimum height
    terminalHeight = 450;
    terminalWidth = terminalHeight * terminalAspect;
    console.log(`📏 Terminal video set to minimum height (450px)`);
  } else {
    // Dimensions are within acceptable range
    terminalHeight = targetHeight;
    terminalWidth = widthAtTargetHeight;
  }
  
  // Round to integers
  terminalWidth = Math.round(terminalWidth);
  terminalHeight = Math.round(terminalHeight);
  
  const terminalX = 0;
  const terminalY = 0;
  
  // Simulator video dimensions and position
  const simWidth = Math.round(containerWidth * 0.5); // 50% of container width
  // Calculate sim height to maintain its aspect ratio
  const simHeight = Math.round(simWidth * (simulator.height / simulator.width));
  const simX = containerWidth - simWidth;
  const simY = containerHeight - simHeight;

  console.log('\n📐 Calculated layout:');
  console.log(`   Container: ${containerWidth}x${containerHeight}`);
  console.log(`   Terminal: ${terminalWidth}x${terminalHeight} at (${terminalX}, ${terminalY})`);
  console.log(`   Simulator: ${simWidth}x${simHeight} at (${simX}, ${simY})`);

  // Build ffmpeg command with complex filter
  // Determine codec based on output format
  const outputExt = outputPath.toLowerCase();
  const isMP4 = outputExt.endsWith('.mp4');
  const isWebM = outputExt.endsWith('.webm');
  const isMOV = outputExt.endsWith('.mov');
  
  let codecArgs: string[];
  
  if (isMP4) {
    codecArgs = ['-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p'];
    console.warn('⚠️  Warning: MP4 format does not support transparency. Use .mov or .webm for transparent background.');
  } else if (isWebM) {
    codecArgs = ['-c:v', 'libvpx-vp9', '-crf', '18', '-b:v', '0', '-pix_fmt', 'yuva420p'];
    console.log('✨ Using VP9 codec with alpha channel support for WebM');
  } else if (isMOV) {
    codecArgs = ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le'];
    console.log('✨ Using ProRes 4444 codec with alpha channel support for MOV');
  } else {
    throw new Error('Unknown output format');
  }
  
  const ffmpegCmd = [
    'ffmpeg',
    '-i', `"${terminal.path}"`,
    '-i', `"${simulator.path}"`,
    '-filter_complex',
    `"[0:v]scale=${terminalWidth}:${terminalHeight}[terminal];` +
    `[1:v]scale=${simWidth}:${simHeight}[sim];` +
    `nullsrc=s=${containerWidth}x${containerHeight}:d=${Math.max(terminal.duration, simulator.duration)}:r=30,format=yuva444p[bg];` +
    `[bg][terminal]overlay=${terminalX}:${terminalY}[comp1];` +
    `[comp1][sim]overlay=${simX}:${simY}[out]"`,
    '-map', '"[out]"',
    ...codecArgs,
    '-y',
    `"${outputPath}"`
  ].join(' ');

  console.log('\n🎬 Starting video composition...');
  
  try {
    execSync(ffmpegCmd, { 
      stdio: 'inherit'
    });
    console.log(`\n✅ Video successfully created: ${outputPath}`);
  } catch (error) {
    throw new Error('Failed to composite videos with ffmpeg');
  }
}

// Main program
const program = new Command();

program
  .name('generate-realtime-sync-demo-video')
  .description('Composite terminal and simulator videos with transparent background')
  .version('1.0.0')
  .requiredOption('--terminal-video <path>', 'Path to terminal video file')
  .requiredOption('--simulator-video <path>', 'Path to simulator/phone video file')
  .requiredOption('-o, --output <path>', 'Output video path (.mov for ProRes, .webm for VP9, .mp4 for H.264)', 'composite-demo.mov')
  .action((options) => {
    try {
      console.log('🎥 Video Compositor for Realtime Sync Demo\n');
      
      console.log('📋 Supported output formats:');
      console.log('   • .mov  → ProRes 4444 (best quality, transparency support)');
      console.log('   • .webm → VP9 (web-friendly, transparency support)');
      console.log('   • .mp4  → H.264 (universal compatibility, no transparency)\n');
      
      // Get video information
      console.log('📊 Analyzing input videos...');
      const terminalInfo = getVideoInfo(options.terminalVideo);
      const simulatorInfo = getVideoInfo(options.simulatorVideo);
      
      // Validate videos
      validateVideos(terminalInfo, simulatorInfo);
      
      // Composite videos
      compositeVideos(terminalInfo, simulatorInfo, options.output);
      
    } catch (error) {
      console.error('\n❌ Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();