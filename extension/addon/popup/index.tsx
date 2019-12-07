import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { render } from "react-dom";
import * as React from "react";

import Popup from "addon/popup/components/Popup";

render(<Popup />, document.getElementById("mount"));
