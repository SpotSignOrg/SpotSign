extern crate rand;

use ed25519_dalek::Keypair;
use ed25519_dalek::Signature;
use ed25519_dalek::PublicKey;
use rand::rngs::OsRng;
use wasm_bindgen::prelude::*;
use base64::encode;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    console_error_panic_hook::set_once();

    let mut csprng: OsRng = OsRng::new().unwrap();

    let keypair: Keypair = Keypair::generate(&mut csprng);

    let message: &[u8] = b"This message is signed.";
    let signature: Signature = keypair.sign(message);

    assert!(keypair.verify(message, &signature).is_ok());

    let public_key: PublicKey = keypair.public;
    assert!(public_key.verify(message, &signature).is_ok());

    let public_key_bytes = &public_key.to_bytes();
    let public_key_string = encode(public_key_bytes);

    alert(&format!("Hello, {}!", public_key_string));
}
