'use babel';

export default class FronkensteenAtomPluginView {

  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('fronkensteen-atom-repl');
    this.element.classList.add('native-key-bindings');
    this.modalPanel = null;
    this.parent = null;
    const serverDiv = document.createElement('div');
    const hostprompt =  document.createElement('span');
    hostprompt.textContent = "REPL host: "
    serverDiv.appendChild(hostprompt)
    this.hostInput = document.createElement("input");
    this.hostInput.setAttribute('type', 'text');
    this.hostInput.setAttribute('size', '30');
    this.hostInput.setAttribute('value',"localhost:5901");
    serverDiv.appendChild(this.hostInput);
    this.element.appendChild(serverDiv);
    const passPhraseDiv = document.createElement('div');
    const passprompt = document.createElement('span');
    passprompt.textContent = "Passphrase: ";
    passPhraseDiv.classList.add('message');
    passPhraseDiv.classList.add('native-key-bindings');
    passPhraseDiv.appendChild(passprompt);
    this.passInput = document.createElement("input");
    this.passInput.setAttribute('type', 'password');
    this.passInput.setAttribute('size', '30');
    this.passInput.setAttribute('value',"");
    passPhraseDiv.appendChild(this.passInput);
    let closeButton = document.createElement("button");
    closeButton.textContent = "Connect";
    passPhraseDiv.appendChild(closeButton);
    let cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    passPhraseDiv.appendChild(cancelButton);
    let self = this;
    closeButton.onclick = function (){self.modalPanel.hide(); self.parent.connectToREPLServer();};
    cancelButton.onclick = function (){self.modalPanel.hide();};
    this.element.appendChild(passPhraseDiv);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  setModalPanel(panel){
    this.modalPanel = panel;
  }
  setParent(parent){
    this.parent = parent;
  }
  getPassPhrase(){
    return this.passInput.value
  }
  getHost(){
    return this.hostInput.value
  }

}
