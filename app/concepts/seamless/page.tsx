'use client';

import React, { useState, useEffect } from 'react';
import AppStoreButton from '@/components/AppStoreButton';
import GooglePlayButton from '@/components/GooglePlayButton';
import NpmButton from '@/components/NpmButton';
import StarOnGithubButton from '@/components/GithubButton';
import LaunchWebAppButton from '@/components/WebAppButton';
import { Image } from 'nextra/components';
import { BentoBoxes } from '@/components/marketing';
import PhoneBundle from '@/components/phones/PhoneBundle';

// Download links constants (same as main page)
const NPM_LINK = 'https://www.npmjs.com/package/happy-coder';
const GOOGLE_PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.ex3ndr.happy';
const APP_STORE_LINK = 'https://apps.apple.com/us/app/happy-claude-code-client/id6748571505';

export default function SeamlessPage() {
  // Device detection state (same as main page)
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Client-side device detection
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  // Render store buttons based on device type (same as main page)
  const renderStoreButtons = () => {
    switch (deviceType) {
      case 'ios':
        return (
          <>
            <AppStoreButton href={APP_STORE_LINK} />
          </>
        );
      case 'android':
        return (
          <>
            <GooglePlayButton href={GOOGLE_PLAY_LINK} />
          </>
        );
      case 'desktop':
      default:
        return (
          <>
            <GooglePlayButton href={GOOGLE_PLAY_LINK} />
            <AppStoreButton href={APP_STORE_LINK} />
          </>
        );
    }
  };

  return (
    <div className="font-sans text-gray-900 bg-white leading-relaxed">
        {/* App Screenshot with load animation */}
        <PhoneBundle 
          size="medium" 
          className="mb-16" 
          animationDelay={500}
        />

      {/* Hero Section */}
      <section className="py-24 pb-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold mb-5 leading-tight">
                Your Claude Code CLI,&nbsp;Now Seamlessly Mobile
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                The only tool that gives you real-time handoff between your terminal and phone. 
                Start on your laptop, continue on your phone, pick up where you left off.
              </p>
              
              <div className="mb-10">
                <div className="flex items-start mb-4 text-base text-gray-700">
                  <span className="text-green-500 mr-2.5 font-bold">✓</span>
                  <span>Real-time sync between CLI and mobile - same session, everywhere</span>
                </div>
                <div className="flex items-start mb-4 text-base text-gray-700">
                  <span className="text-green-500 mr-2.5 font-bold">✓</span>
                  <span>100% Free & Open Source (MIT Licensed)</span>
                </div>
                <div className="flex items-start mb-4 text-base text-gray-700">
                  <span className="text-green-500 mr-2.5 font-bold">✓</span>
                  <span>Works with your existing Claude Code workflow</span>
                </div>
                <div className="flex items-start mb-4 text-base text-gray-700">
                  <span className="text-green-500 mr-2.5 font-bold">✓</span>
                  <span>Multiple concurrent sessions support</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-5">
                <div className="flex gap-4 flex-wrap">
                  {renderStoreButtons()}
                </div>
                <div className="flex gap-4 items-center">
                  <StarOnGithubButton href="https://github.com/slopus/happy" />
                  <LaunchWebAppButton href="https://app.happy.engineering" />
                </div>
              </div>
            </div>
            
            <div className="relative h-[500px]">
              <div className="absolute w-full h-[300px] top-0 left-0 bg-gray-900 text-gray-300 p-5 font-mono rounded-xl shadow-2xl flex items-center justify-center">
                Terminal Screenshot
              </div>
                <Image
                  src="/app-2.png"
                  alt="Claude Code in Happy Coder App Screenshot 2"
                  width={180}
                  height={363}
                  className="bottom-0 right-5 absolute shadow-2xl rounded-[30px]"
                />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-green-500 text-white rounded-full text-xs font-semibold z-10">
                ⚡ Real-time Sync
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5">
          <BentoBoxes />
        </div>
      </section>

      {/* Real Use Cases */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">When Mobile Actually Makes Sense</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Let's be honest - serious coding happens on laptops. But there are real moments when mobile access is valuable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 mb-3 font-medium">Before Bed</span>
              <h3 className="text-xl mb-3">Queue Tomorrow's Work</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Set up a simple task or idea before sleeping. Wake up with something already in progress - a productivity hack that actually works.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 mb-3 font-medium">At the Gym</span>
              <h3 className="text-xl mb-3">Plan Mode Thinking</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Between sets, write out prompts and plan your approach. Not writing code, but clarifying what you want the agent to build.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 mb-3 font-medium">Couch Time</span>
              <h3 className="text-xl mb-3">Low-Focus Multitasking</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                While watching TV, squeeze out a few tickets. Your laptop would be "too involved" but your phone? That's just texting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Unix Philosophy: Do One Thing Well</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Not another agent platform. Just seamless access to your existing Claude Code CLI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            <div className="text-center">
              <div className="inline-block w-10 h-10 leading-10 bg-gray-100 rounded-full font-semibold mb-4">1</div>
              <h3 className="text-lg mb-2.5">Start Your CLI</h3>
              <p className="text-gray-600 text-sm">Use Claude Code as you always do</p>
              <div className="bg-gray-50 p-4 rounded-md font-mono text-sm mt-2.5">$ happy-cli</div>
            </div>
            
            <div className="text-center">
              <div className="inline-block w-10 h-10 leading-10 bg-gray-100 rounded-full font-semibold mb-4">2</div>
              <h3 className="text-lg mb-2.5">Open Mobile App</h3>
              <p className="text-gray-600 text-sm">Your session appears instantly, synced in real-time</p>
            </div>
            
            <div className="text-center">
              <div className="inline-block w-10 h-10 leading-10 bg-gray-100 rounded-full font-semibold mb-4">3</div>
              <h3 className="text-lg mb-2.5">Seamless Handoff</h3>
              <p className="text-gray-600 text-sm">Type on phone, continue on laptop. Same session, no friction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Different Approach, Better Philosophy</h2>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white rounded-xl overflow-hidden border border-gray-200 mt-16">
            <div className="grid grid-cols-4 p-5 bg-gray-50 font-semibold border-b border-gray-200">
              <span>Feature</span>
              <span className="font-semibold text-blue-500">Happy Coder</span>
              <span>Others</span>
              <span>Others</span>
            </div>
            <div className="grid grid-cols-4 p-5 border-b border-gray-200">
              <span>Real-time CLI sync</span>
              <span className="text-green-500 font-bold">✓</span>
              <span className="text-red-500">✗</span>
              <span className="text-red-500">✗</span>
            </div>
            <div className="grid grid-cols-4 p-5 border-b border-gray-200">
              <span>Free & Open Source</span>
              <span className="text-green-500 font-bold">✓</span>
              <span className="text-red-500">✗</span>
              <span className="text-red-500">✗</span>
            </div>
            <div className="grid grid-cols-4 p-5 border-b border-gray-200">
              <span>Works with existing CLI</span>
              <span className="text-green-500 font-bold">✓</span>
              <span className="text-red-500">✗</span>
              <span className="text-red-500">✗</span>
            </div>
            <div className="grid grid-cols-4 p-5 border-b border-gray-200">
              <span>Multiple sessions</span>
              <span className="text-green-500 font-bold">✓</span>
              <span>?</span>
              <span>?</span>
            </div>
            <div className="grid grid-cols-4 p-5 border-b border-gray-200">
              <span>Background agents</span>
              <span>CLI-based</span>
              <span className="text-green-500 font-bold">✓</span>
              <span className="text-green-500 font-bold">✓</span>
            </div>
            <div className="grid grid-cols-4 p-5">
              <span>Price</span>
              <span className="font-semibold text-blue-500">Free</span>
              <span>$X/mo</span>
              <span>Waitlist</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex justify-between items-center">
            <div className="flex gap-8">
              <a href="#" className="text-gray-600 no-underline text-sm hover:text-black">GitHub</a>
              <a href="#" className="text-gray-600 no-underline text-sm hover:text-black">Documentation</a>
              <a href="#" className="text-gray-600 no-underline text-sm hover:text-black">Discord</a>
              <a href="#" className="text-gray-600 no-underline text-sm hover:text-black">Twitter</a>
            </div>
            <div className="text-gray-600 text-sm">
              MIT Licensed | Built by developers who get it
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
