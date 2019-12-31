import * as React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { saveIdentity } from "addon/popup/state/actions";
import { Identity } from "addon/popup/state";
import { useState } from "addon/popup/state";

export const IdentityEdit: React.FunctionComponent<{ identity: Identity }> = ({ identity }) => {
  const [formValidated, setFormValidated] = React.useState(false);

  const [name, setName] = React.useState("");
  const [password1, setPassword1] = React.useState("");
  const [password2, setPassword2] = React.useState("");

  const { dispatch } = useState();

  const validPasswords = password1.length >= 6 && password2.length >= 6 && password1 === password2;
  console.log("valid passwords", validPasswords);
  const validName = name.length > 0;
  const validForm = validPasswords && validName;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() && validForm) {
      dispatch(saveIdentity(identity, name, password1));
    }

    setFormValidated(true);
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Control
          required
          placeholder="Name"
          isValid={formValidated && validName ? true : undefined}
          isInvalid={formValidated && !validName ? true : undefined}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <Form.Control.Feedback type="invalid">Name is required. </Form.Control.Feedback>
      </Form.Group>

      <Form.Group>
        <Form.Control
          required
          type="password"
          placeholder="Password"
          isValid={formValidated && validPasswords ? true : undefined}
          isInvalid={formValidated && !validPasswords ? true : undefined}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword1(e.target.value)}
        />
        <Form.Control.Feedback type="invalid">
          Password must be at least 6 characters and must match.
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group>
        <Form.Control
          required
          type="password"
          placeholder="Confirm Password"
          isValid={formValidated && validPasswords ? true : undefined}
          isInvalid={formValidated && !validPasswords ? true : undefined}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword2(e.target.value)}
        />
        <Form.Control.Feedback type="invalid">
          Password must be at least 6 characters and must match.
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="text-right">
        <Button type="submit">Save</Button>
      </Form.Group>
    </Form>
  );
};
