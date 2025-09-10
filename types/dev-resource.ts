// Base interface for common properties
interface BaseDevResource {
  name: string;
  path: string;
  category: string;
  content: string;
  description: string;
}

// Agent type (.md files)
export interface AgentDevResource extends BaseDevResource {
  type: 'agent';
}

// Command type (.md files)
export interface CommandDevResource extends BaseDevResource {
  type: 'command';
}

// MCP type (.json files)
export interface McpDevResource extends BaseDevResource {
  type: 'mcp';
}

// Setting type (.json files)
export interface SettingDevResource extends BaseDevResource {
  type: 'setting';
}

// Hook type (.json files)
export interface HookDevResource extends BaseDevResource {
  type: 'hook';
}

// Sandbox type (.json files)
export interface SandboxDevResource extends BaseDevResource {
  type: 'sandbox';
}

// Template type (directory structure)
export interface TemplateDevResource {
  name: string;
  id: string;
  type: 'template';
  subtype: 'language' | 'framework';
  category: 'languages' | 'frameworks';
  description: string;
  files: string[];
  installCommand: string;
  language?: string; // Only for framework templates
}

// Union type for all DevResource variants
export type DevResource = 
  | AgentDevResource 
  | CommandDevResource 
  | McpDevResource 
  | SettingDevResource 
  | HookDevResource 
  | SandboxDevResource 
  | TemplateDevResource;

// Type guards for runtime type checking
export function isAgentResource(resource: DevResource): resource is AgentDevResource {
  return resource.type === 'agent';
}

export function isCommandResource(resource: DevResource): resource is CommandDevResource {
  return resource.type === 'command';
}

export function isMcpResource(resource: DevResource): resource is McpDevResource {
  return resource.type === 'mcp';
}

export function isSettingResource(resource: DevResource): resource is SettingDevResource {
  return resource.type === 'setting';
}

export function isHookResource(resource: DevResource): resource is HookDevResource {
  return resource.type === 'hook';
}

export function isSandboxResource(resource: DevResource): resource is SandboxDevResource {
  return resource.type === 'sandbox';
}

export function isTemplateResource(resource: DevResource): resource is TemplateDevResource {
  return resource.type === 'template';
}