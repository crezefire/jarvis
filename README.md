# Jarvis
A Slack bot which does some stuff. Mostly picking out people for buddy (code review) through groups)

Can be activated using a custom emoji current activation phrase: `:jkl:`

Currently supported commands:

- group add | ls | rm | mv | save | load
- user add | ls | rm
- buddy

All commands support a help parameter eg: `:jkl: group help` or `:jkl: help`

## Developer Setup

This repo comes with everything setup out of the box. (Tested on Ubuntu 16.04)

To setup use:
- VSCode
    - Setup your API as an env variable SLACK_API_TOKEN (main.ts Line 9)
    - Ctrl + Shift + B to build first
    - Then F5 to run
    - Has tasks + maps setup for debugging
- Use inbuilt TS package (already setup in node_modules)
- Use inbuilt node.js distribution for x64 linux setup in node-v6.9.1-linux-x64
- Lastly, groups are saved as *.groups.json

