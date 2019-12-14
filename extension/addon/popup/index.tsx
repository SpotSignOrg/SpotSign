import "bootstrap/dist/css/bootstrap.min.css";
import { render } from "react-dom";
import * as React from "react";

import { Popup } from "addon/popup/components/Popup";
import { State } from "addon/popup/state";

(async () => {
  const storedState: State = await browser.storage.local.get();
  console.log("Found stored state", storedState);

  render(<Popup storedState={storedState} />, document.getElementById("mount"));
})();
