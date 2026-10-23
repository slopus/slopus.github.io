# Drive a Happy Agent over its REST API

Use this recipe when a script or another agent should message a Happy agent directly and read its
reply. It shows the shortest working path. The installed release's `API.md` (in the source
checkout, `packages/happy-agent/API.md`) is the complete contract: read it for every field, error,
and route this page leaves out.

## Connect and authenticate

A standalone daemon serves HTTP only on the Unix socket `~/.happy/agent/server.sock`, and every
request needs the bearer token from `~/.happy/agent/token`. Both live under
`$HAPPY_HOME_DIR/agent` when that is set. The token is the daemon's full credential: never echo,
log, or paste it, and keep it out of command arguments. Write it once into a private header file,
then wait until health reports `ready: true`:

```sh
HAPPY_DIR="${HAPPY_HOME_DIR:-$HOME/.happy}/agent"
HAPPY_SOCKET="$HAPPY_DIR/server.sock"
HAPPY_AUTH="$(mktemp)"   # created with mode 0600
trap 'rm -f "$HAPPY_AUTH"' EXIT
printf 'Authorization: Bearer %s\n' "$(cat "$HAPPY_DIR/token")" > "$HAPPY_AUTH"
happy_api() { curl -sS --unix-socket "$HAPPY_SOCKET" -H @"$HAPPY_AUTH" "http://localhost$@"; }

happy_api /v0/health | jq '{ready, version}'
```

**Remote and team daemons.** The local daemon proxies every remote it has configured: list them
with `GET /v0/connections`, then prefix any path below with `/v0/connections/<id>/api`. The local
daemon supplies the remote's credentials, including a team's WorkOS token, so the script only
needs the local token. To sign in to a team daemon directly, see Authentication in `API.md`.

```sh
happy_api /v0/connections/build-mac/api/v0/health | jq '{ready, version}'
```

## Find an agent

The Chief of Staff is the bot whose `systemKey` is `"chief_of_staff"`:

```sh
AGENT_ID=$(happy_api /v0/bots | jq -r '.bots[]
    | select(.systemKey == "chief_of_staff" and .status == "active") | .agent.id')
```

There is no global agent list. Every bot and task embeds its one agent as `agent` (`/v0/bots`,
`/v0/tasks`), and every project and workspace lists its agents in `agents` (`/v0/projects`,
`/v0/workspaces`).

## Send a message

A send needs `text`, a complete `mode` (model, effort, and permission mode), and your own `id`.
Copy the agent's current mode instead of building one:

```sh
MODE=$(happy_api "/v0/agents/$AGENT_ID/mode" | jq -c .mode)
MSG_ID="m$(openssl rand -hex 12)"
jq -n --arg id "$MSG_ID" --arg text "Summarize today's open work in three bullets." \
    --argjson mode "$MODE" '{id: $id, text: $text, mode: $mode}' |
    happy_api "/v0/agents/$AGENT_ID/send" -H 'content-type: application/json' --data-binary @- |
    jq '{id: .message.id, status: .message.status}'
```

If `mode` is `null`, the agent has never received a message: use `.config.defaults` from
`GET /v0/config` with `serviceTier: null` added.

## Read the reply

History is grouped by run. Poll it until the run holding your message has finished, then print
the agent's text. Give the loop a deadline in real scripts:

```sh
until RUN=$(happy_api "/v0/agents/$AGENT_ID/messages?omitToolData=true" | jq -e --arg m "$MSG_ID" \
    '.runs[] | select(any(.messages[]; .id == $m)) | select(.status != "running")'); do
    sleep 3
done
jq -r '.messages[] | select(.role == "agent") | .content[] | select(.type == "text") | .text' <<<"$RUN"
```

For live updates instead of polling, follow `GET /v0/events/stream` (see Events in `API.md`).

## Pitfalls

- **`mode` is required.** Copy it from `/mode` rather than guessing; an unknown or disabled
  model, effort, or service tier is `400`.
- **Retry with the same `id`.** It returns the original message instead of sending twice. IDs are
  lowercase letters and digits starting with a letter; UUIDs are rejected.
- **`409` on send means the agent can't receive messages:** it is a hidden subagent or archived.
- **Branch on `code`, not `error`.** In an error body, `error` is display text; `code` is stable.
- **Don't test on real agents.** When verifying a deployed node, follow
  [Testing a deployed node](README.md#testing-a-deployed-node).
