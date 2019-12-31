import "bootstrap/dist/css/bootstrap.min.css";
import { render } from "react-dom";
import * as React from "react";

import { Popup } from "addon/popup/components/Popup";
import { StoredState } from "addon/popup/state";

(async () => {
  const storedState: StoredState = await browser.storage.local.get();
  render(<Popup storedState={storedState} />, document.getElementById("mount"));
})();
