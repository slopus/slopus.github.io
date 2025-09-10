import { 
  Decoder, 
  decodeValue, 
  str, 
  object, 
  array, 
  maybe, 
  oneOf, 
  union,
  map,
  field,
} from 'ts-json-decode';
import {
  DevResource,
  AgentDevResource,
  CommandDevResource,
  McpDevResource,
  SettingDevResource,
  HookDevResource,
  SandboxDevResource,
  TemplateDevResource
} from '../types/dev-resource';

const succeed = <T>(v: T): Decoder<T> => {
  return (_value: any): T => {
    return v;
  };
}

// Custom andThen combinator for efficient discriminated unions
const andThen = <A, B>(
  decoder: Decoder<A>,
  f: (value: A) => Decoder<B>
): Decoder<B> => {
  return (value: any): B => {
    const decodedA = decoder(value);
    const nextDecoder = f(decodedA);
    return nextDecoder(value);
  };
};

const agentResourceDecoder: Decoder<AgentDevResource> = object({
  name: str,
  path: str,
  category: str,
  type: succeed<'agent'>('agent'),
  content: str,
  description: str,
});

const commandResourceDecoder: Decoder<CommandDevResource> = object({
  name: str,
  path: str,
  category: str,
  type: succeed<'command'>('command'),
  content: str,
  description: str,
});

const mcpResourceDecoder: Decoder<McpDevResource> = object({
  name: str,
  path: str,
  category: str,
  type: succeed<'mcp'>('mcp'),
  content: str,
  description: str,
});

const settingResourceDecoder: Decoder<SettingDevResource> = object({
  name: str,
  path: str,
  category: str,
  type: succeed<'setting'>('setting'),
  content: str,
  description: str,
});

const hookResourceDecoder: Decoder<HookDevResource> = object({
  name: str,
  path: str,
  category: str,
  type: succeed<'hook'>('hook'),
  content: str,
  description: str,
});

const sandboxResourceDecoder: Decoder<SandboxDevResource> = object({
  name: str,
  path: str,
  category: str,
  type: succeed<'sandbox'>('sandbox'),
  content: str,
  description: str,
});

const templateResourceDecoder: Decoder<TemplateDevResource> = object({
  name: str,
  id: str,
  type: succeed<'template'>('template'),
  subtype: union(str, 'language', 'framework'),
  category: union(str, 'languages', 'frameworks'),
  description: str,
  files: array(str),
  installCommand: str,
  language: maybe(str),
});

export const devResourceDecoder: Decoder<DevResource> = andThen(
  field('type', union(str, 'agent', 'command', 'mcp', 'setting', 'hook', 'sandbox', 'template')),
  (type): Decoder<DevResource> => {
    switch (type) {
      case 'agent': return agentResourceDecoder;
      case 'command': return commandResourceDecoder;
      case 'mcp': return mcpResourceDecoder;
      case 'setting': return settingResourceDecoder;
      case 'hook': return hookResourceDecoder;
      case 'sandbox': return sandboxResourceDecoder;
      case 'template': return templateResourceDecoder;
      default:
        const _x: never = type;
        return _x;
    }
  }
);

export function parseDevResources(data: unknown): DevResource[] {
  return decodeValue(array(devResourceDecoder), data);
}