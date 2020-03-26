# fronkensteen-atom-repl package

The fronkensteen-atom-repl plugin package for Atom. Used to execute Scheme code in a remote Fronkensteen app from the Atom editor.

Usage:

1. Place the REPL package files in ~/.atom/packages/fronkensteen-atom-repl and restart the Atom editor.
2. Load a Fronkensteen app in a browser and open app/init.scm in the editor. Uncomment the `(launch-remote-repl-server)` line, update the file, and save the updated Fronkensteen system. Load the updated system into the browser.
3. Start the Fronkensteen REPL server with:

`node fronkensteen-server`

from a checked-out Fronkensteen repo (though the base Fronkensteen system doesn't require anything but a browser, sadly running a remote REPL does at this time).
4. You will now be able to evaluate Scheme expressions in the app from within the Atom editor, even if they are running on different machines (provided there are no firewalls, NATs, etc. in the way, of course).
5. The first time you attempt to evaluate an expression from within Atom, you'll get a popup window that allows you to enter the hostname (or IP address), port number, and passphrase. Enter the corresponding values and try again.
6. To evaluate a single Scheme expression, place the cursor just after the final ) and press Ctrl-R.
8. To evaluate a larger block of code, select the code block and press Ctrl-R. You can also evaluate expressions from the right-click context menu or from the Packages menu.

If there's a problem with the expression (e.g., unbalanced parentheses), you'll get an error alert. If the expression is okay, it will be evaluated within the remote Fronkensteen app, and the result will be inserted as a Scheme comment into the Atom editor. The result will be selected, so it's easy to remove it by just hitting the spacebar (alternatively, Ctrl-Z or Command-Z will also remove it).

Happy Scheming!
