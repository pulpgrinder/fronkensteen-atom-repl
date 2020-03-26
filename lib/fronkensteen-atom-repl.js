'use babel';
const { SHA3 } = require('sha3');
const WebSocket = require('ws');
import FronkensteenAtomPluginView from './fronkensteen-atom-repl-view';
import { CompositeDisposable } from 'atom';
let simpleREPLDriver =  {
	password:"",
	replSocket:null,
	displayFunc:function(message){console.log(message);},
	connectToREPLServer:function(server,password,displayFunc){
		console.log("Attempting to connect to " + server + " " + password)
	  let tempsocket = new WebSocket("ws://" + server);
	  tempsocket.onopen = function(event) {
		  console.log('Connected to remote REPL.');
		  simpleREPLDriver.replSocket = tempsocket;
		  simpleREPLDriver.password = password;
		  simpleREPLDriver.displayFunc = displayFunc;
	  };
	  tempsocket.onmessage = function(event){
			let message = event.data;
			let parsedMessage = JSON.parse(message);
			let status = parsedMessage["status"];
			if(status === "OK"){
				let result = parsedMessage["result"];
				let signature = parsedMessage["signature"];
				let hash = new SHA3(512);
     	    	hash.update(result + simpleREPLDriver.password);
	  			let checksig = hash.digest("hex");
					if(checksig !== signature){
			  	simpleREPLDriver.displayFunc("Invalid signature from REPL server. Check password.");
			  	return;
				}
				simpleREPLDriver.displayFunc(result);
			}
			else {
				simpleREPLDriver.displayFunc(status);
			}
		}
	  tempsocket.onerror = function(event){
		simpleREPLDriver.displayFunc("Error communicating with REPL server.");
		tempsocket.close();
		simpleREPLDriver.replSocket = null;
		simpleREPLDriver.password = "";
	  }
		tempsocket.onclose = function(event){
		simpleREPLDriver.displayFunc("REPL server:socket closed");
		simpleREPLDriver.replSocket = null;
		simpleREPLDriver.password = "";
	  }
	},

	evalRemote:function(expr){
	  if(simpleREPLDriver.replSocket === null){
			simpleREPLDriver.displayFunc("Not connected!");
			return;
	  }
	  let hash = new SHA3(512);
    hash.update(expr + simpleREPLDriver.password);
	  let signature = hash.digest("hex");
	  let message = JSON.stringify({"expr":expr,"signature":signature});
	  let socket = simpleREPLDriver.replSocket;
	  socket.send(message);
	}
}

export default {

  fronkensteenAtomPluginView: null,
  modalPanel: null,
  subscriptions: null,
  passPhrase: null,
	activeExpression:null,
  activate(state) {
    this.fronkensteenAtomPluginView = new FronkensteenAtomPluginView(state.fronkensteenAtomPluginViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.fronkensteenAtomPluginView.getElement(),
      visible: true
    });
    this.fronkensteenAtomPluginView.setModalPanel(this.modalPanel);
    this.fronkensteenAtomPluginView.setParent(this);
    if(this.passPhrase === null){
      this.modalPanel.show();
    }
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'fronkensteen-atom-repl:toggle': () => this.toggle()
    }));
		this.subscriptions.add(atom.commands.add('atom-workspace', {
      'fronkensteen-atom-repl:finddoc': () => this.finddoc()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.fronkesteenAtomPluginView.destroy();
  },

  serialize() {
    return {
      fronkensteenAtomPluginViewState: this.fronkensteenAtomPluginView.serialize()
    };
  },

	finddoc(){
		let editor
		let offset
		let passPhrase = this.fronkensteenAtomPluginView.getPassPhrase();
		if(passPhrase === ""){
			this.modalPanel.show();
			return;
		}
		let server = this.fronkensteenAtomPluginView.getHost();
		if(server === ""){
			this.modalPanel.show();
			return;
		}
		if(simpleREPLDriver.replSocket === null){
			this.modalPanel.show();
			return;
		}
		if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();
			let selectedRange = editor.getSelectedBufferRange();
      let endpos= selectedRange["end"]
			if(selection === ""){
				let preceding = editor.getTextInBufferRange([[0, 0], endpos]);
				for(offset = preceding.length - 1; offset >= 0; offset--){
					let testchar = preceding.charAt(offset);
					if(testchar.match(/[\s\n\(]/) !== null){
						offset = offset + 1;
						selection = preceding.substring(offset,preceding.length);
						break;
					}
				}
				if(offset < 0){
					alert("Nothing to search for.");
					return;
				}
			}
      editor.setSelectedBufferRange([endpos,endpos]);
      simpleREPLDriver.evalRemote('(retrieve-doc "' + selection + '")');
		}
	},
  toggle() {
    let editor
    let balancecheck
		let offset
    let passPhrase = this.fronkensteenAtomPluginView.getPassPhrase();
    if(passPhrase === ""){
      this.modalPanel.show();
      return;
    }
		let server = this.fronkensteenAtomPluginView.getHost();
		if(server === ""){
			this.modalPanel.show();
      return;
		}
		if(simpleREPLDriver.replSocket === null){
			this.modalPanel.show();
			return;
		}
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      let selectedRange = editor.getSelectedBufferRange();
      let endpos= selectedRange["end"]
      editor.setSelectedBufferRange([endpos,endpos]);
      if(selection === ""){
        let preceding = editor.getTextInBufferRange([[0, 0], endpos])
        for(offset = preceding.length - 1; offset >= 0; offset--){
          let candidate =  preceding.substring(offset,preceding.length);
          balancecheck = this.balanced(candidate);
          if(balancecheck === true){
            selection = candidate;
            break;
          }
        }
        if(offset < 0){
          alert("No balanced expression found preceding cursor.");
          return;
        }
      }
      else {
        balancecheck = this.balanced(selection);
      }
       if(balancecheck === true){
       	 simpleREPLDriver.evalRemote(selection);
      }
      else{
        if(balancecheck !== []){
          alert(selection + " Missing " + balancecheck.join(""));
        }
        else {
          alert("Unparseable.")
        }
      }
    }
  },

  balanced(str){
    var result = this.balanced2(str,[])
    if(result === true){
      return true;
    }
    return result;
  },

  balanced2(str,expect){
    var stringtype = "";
    var lastchar = null;
    for(var i = 0; i < str.length; i++){
      var currentchar = str.charAt(i);
      if(lastchar === "\\"){ // Escaped char
        lastchar = null;
        continue;
      }
      if(currentchar === "\\"){
        lastchar = "\\";
        continue;
      }

      if(currentchar === '"'){
        if(stringtype === '"'){ // End of string
          stringtype = "";
          lastchar = null;
          continue;
        }
        else{
          stringtype = currentchar;
          lastchar = null;
          continue;
        }
      }
      if(stringtype !== ""){ // In a string.
        lastchar = null;
        continue;
      }
      lastchar = currentchar;
      switch(currentchar){
        case '(': expect.push(')');
        continue;
        case '[': expect.push(']');
        continue;
        case '{': expect.push('}');
        continue;
        case ')':
        case ']':
        case '}': if((expect.length > 0) && (expect.pop() === currentchar)){
          continue;
        }
        else {
          switch(currentchar){
            case ')': return ['('];
            case ']': return ['['];
            case '}': return ['{'];
          }
        }
        default: continue;
      }
    }
    if((expect.length === 0) && (stringtype === "")){
      return true;
    }
    return expect;
  },
	connectToREPLServer(){
		let passPhrase = this.fronkensteenAtomPluginView.getPassPhrase();
		if(passPhrase === ""){
			this.modalPanel.show();
			return;
		}
		let server = this.fronkensteenAtomPluginView.getHost();
		if(server === ""){
			this.modalPanel.show();
			return;
		}
	 simpleREPLDriver.connectToREPLServer(server,passPhrase,displayResult)
	}
}

	function displayResult(result){
		if (editor = atom.workspace.getActiveTextEditor()) {
		 let selectedRange = editor.getSelectedBufferRange();
		 let endpos= selectedRange["end"]
		 let valueString = " ; " + result
     editor.insertText(valueString);
     editor.setSelectedBufferRange([endpos,[endpos.row,endpos.column + valueString.length]]);

	}

};
