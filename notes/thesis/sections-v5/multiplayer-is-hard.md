# Multiplayer is hard

Agents need permissions to do anything. If you let someone talk to your agent, that person now has its permissions. If agents message other agents, those agents need permissions too. Should an automatic reviewer approve an agent asking for more access? Whose commit is it when several people work from the same server?

Group chats in ChatGPT and Claude in Slack already put several people in front of one AI. In Happy you can invite someone into a session today, but the agent still runs on your machine with your permissions. For a whole team, we keep the trust question simple: a team that trusts each other runs a [shared server](https://happy.engineering/desktop/docs/multiplayer/). Everyone connects with their own identity, and every command runs under the same sandbox and review. It's a start, not an answer.

[OpenClaw Enterprise](https://openclaw.ai/blog/openclaw-enterprise), announced September 29, goes further: each agent gets its own identity, and agents and credentials live in separate namespaces with roles. We think that's the right direction. Permissions should belong to the agent, not to whoever happens to be talking to it.

We haven't solved this yet. Whatever we build here, you'll be able to read it, run it on your own server, and point it at any model.
