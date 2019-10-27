use ed25519_dalek::Keypair;
use rand::rngs::OsRng;
use wasm_bindgen::prelude::*;
use base64;
use js_sys;

#[wasm_bindgen]
pub fn get_keys() -> js_sys::Object {
    let mut csprng: OsRng = OsRng::new().unwrap();
    let keypair: Keypair = Keypair::generate(&mut csprng);

    let private_key = base64::encode(&keypair.secret.to_bytes());
    let public_key = base64::encode(&keypair.public.to_bytes());

    let js_keys = js_sys::Object::new();
    js_sys::Reflect::set(&js_keys, &"private_key".into(), &private_key.into()).unwrap();
    js_sys::Reflect::set(&js_keys, &"public_key".into(), &public_key.into()).unwrap();
    js_keys
}

#[wasm_bindgen]
pub fn sign_message(private_key: String, public_key: String, message: String) -> js_sys::Object {
    let private_key_decoded = base64::decode(&private_key).unwrap();
    let public_key_decoded = base64::decode(&public_key).unwrap();

    let mut keypair_bytes = Vec::new();
    keypair_bytes.extend(private_key_decoded.iter().cloned());
    keypair_bytes.extend(public_key_decoded.iter().cloned());

    let keypair: Keypair = Keypair::from_bytes(&keypair_bytes[..]).unwrap();
    let signed = keypair.sign(message.as_bytes());
    let signature_first = base64::encode(&signed.to_bytes()[..32]);
    let signature_second = base64::encode(&signed.to_bytes()[32..]);
    let signature = format!("{}{}", signature_first, signature_second);


    let js_signature = js_sys::Object::new();
    js_sys::Reflect::set(&js_signature, &"signature".into(), &signature.into()).unwrap();
    js_signature
}
// #[wasm_bindgen]
// pub fn greet(name: &str) {
//     console_error_panic_hook::set_once();



//     let message: &[u8] = b"This message is signed.";
//     let signature: Signature = keypair.sign(message);

//     assert!(keypair.verify(message, &signature).is_ok());

//     let public_key: PublicKey = keypair.public;
//     assert!(public_key.verify(message, &signature).is_ok());

//     let public_key_bytes = &public_key.to_bytes();
//     let public_key_string = encode(public_key_bytes);
// }
