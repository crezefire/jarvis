export class CallbackHandler {
    private slack_rtm : any;
    private current_message : any;
    
    constructor(_slack_rtm : any) {
        this.slack_rtm =  _slack_rtm;
        this.current_message = null;
    }

    private SendMessageToChannel(message : string) : void {
        this.slack_rtm.sendMessage(message, this.current_message.channel);
    }

    SetCurrentMessage(_current_message : any) : void {
        this.current_message = _current_message;
    }

    OnRootCommand(object : any, args : string[], arg_pos : number) : void {
        this.SendMessageToChannel("NOTHING NOTHING");
    }

}