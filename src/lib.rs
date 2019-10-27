use ed25519_dalek::Keypair;
use ed25519_dalek::PublicKey;
use ed25519_dalek::Signature;
use rand::rngs::OsRng;
use wasm_bindgen::prelude::*;
use base64;
use js_sys;

#[wasm_bindgen]
pub fn get_keys() -> js_sys::Object {
    console_error_panic_hook::set_once();

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
    console_error_panic_hook::set_once();

    let private_key_decoded = base64::decode(&private_key).unwrap();
    let public_key_decoded = base64::decode(&public_key).unwrap();

    let mut keypair_bytes = Vec::new();
    keypair_bytes.extend(private_key_decoded.iter().cloned());
    keypair_bytes.extend(public_key_decoded.iter().cloned());

    let keypair: Keypair = Keypair::from_bytes(&keypair_bytes[..]).unwrap();
    let signed = keypair.sign(message.as_bytes());
    
    let signed_bytes = &signed.to_bytes();
    let mut signature = String::new();
    base64::encode_config_buf(&signed_bytes[..30], base64::URL_SAFE, &mut signature);
    base64::encode_config_buf(&signed_bytes[30..60], base64::URL_SAFE, &mut signature);
    base64::encode_config_buf(&signed_bytes[60..64], base64::URL_SAFE, &mut signature);

    let js_object = js_sys::Object::new();

    let mut signature_decoded = Vec::new();
    match base64::decode_config_buf(&signature, base64::URL_SAFE, &mut signature_decoded) {
        Ok(_) => (),
        Err(e) => {
            js_sys::Reflect::set(&js_object, &"verified".into(), &format!("Unable to parse Signature: {} {} {:?}", e, signature, &signed_bytes[..]).into()).unwrap();
            return js_object;
        }

    }

    js_sys::Reflect::set(&js_object, &"signature".into(), &signature.into()).unwrap();
    js_object
}

#[wasm_bindgen]
pub fn verify_message(public_key: String, signature: String, message: String) -> js_sys::Object {
    console_error_panic_hook::set_once();

    let js_verified = js_sys::Object::new();

    let public_key_decoded = match base64::decode(&public_key) {
        Ok(v) => v,
        Err(_) => {
            js_sys::Reflect::set(&js_verified, &"verified".into(), &"Unable to base64 decode Public Key".into()).unwrap();
            return js_verified;
        } 
    };

    let mut signature_decoded = Vec::new();
    match base64::decode_config_buf(&signature, base64::URL_SAFE, &mut signature_decoded) {
        Ok(_) => (),
        Err(e) => {
            js_sys::Reflect::set(&js_verified, &"verified".into(), &format!("Unable to parse Signature: {} {}", e, signature).into()).unwrap();
            return js_verified;
        }

    }
    // match base64::decode_config_buf(&signature[32..], base64::STANDARD, &mut signature_decoded) {
    //     Ok(_) => (),
    //     Err(e) => {
    //         js_sys::Reflect::set(&js_verified, &"verified".into(), &format!("Unable to parse Signature[32..]: {}", e).into()).unwrap();
    //         return js_verified;
    //     }

    // }

    let public_key = match PublicKey::from_bytes(&public_key_decoded[..]) {
        Ok(v) => v,
        Err(_) => {
            js_sys::Reflect::set(&js_verified, &"verified".into(), &"Unable to parse Public Key".into()).unwrap();
            return js_verified;
        }
    };

    let signature = Signature::from_bytes(&signature_decoded[..]).unwrap();
    let verified = public_key.verify(message.as_bytes(), &signature);


    match verified {
        Ok(_) => js_sys::Reflect::set(&js_verified, &"verified".into(), &"Verified!".into()).unwrap(),
        Err(_) => js_sys::Reflect::set(&js_verified, &"verified".into(), &"Verification Failed!".into()).unwrap()
    };
    js_verified
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
