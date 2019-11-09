use base64;
use ed25519_dalek::Keypair;
use ed25519_dalek::PublicKey;
use ed25519_dalek::Signature;
use js_sys;
use rand::rngs::OsRng;
use wasm_bindgen::prelude::*;

const DATETIME_LEN: usize = 24;

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
pub fn sign_message(
    private_key: String,
    public_key: String,
    message: String,
    datetime: String,
) -> js_sys::Object {
    console_error_panic_hook::set_once();

    let private_key_decoded = base64::decode(&private_key).unwrap();
    let public_key_decoded = base64::decode(&public_key).unwrap();

    let mut keypair_bytes = Vec::new();
    keypair_bytes.extend(private_key_decoded.iter().cloned());
    keypair_bytes.extend(public_key_decoded.iter().cloned());
    let keypair: Keypair = Keypair::from_bytes(&keypair_bytes[..]).unwrap();

    assert_eq!(datetime.len(), DATETIME_LEN);

    let mut signable: Vec<u8> = Vec::new();
    signable.extend(datetime.as_bytes());
    signable.extend(message.as_bytes());

    let signed = keypair.sign(&signable[..]);

    let mut signature: Vec<u8> = Vec::new();
    signature.extend(datetime.as_bytes());
    signature.extend(&signed.to_bytes()[..]);

    let signature_encoded = base64::encode_config(&signature, base64::URL_SAFE);

    let js_object = js_sys::Object::new();
    js_sys::Reflect::set(&js_object, &"signature".into(), &signature_encoded.into()).unwrap();
    js_object
}

#[wasm_bindgen]
pub fn verify_message(public_key: String, signature: String, message: String) -> js_sys::Object {
    console_error_panic_hook::set_once();

    let js_verified = js_sys::Object::new();

    let public_key_decoded = match base64::decode(&public_key) {
        Ok(v) => v,
        Err(_) => {
            js_sys::Reflect::set(
                &js_verified,
                &"error".into(),
                &"Unable to base64 decode Public Key".into(),
            )
            .unwrap();
            return js_verified;
        }
    };

    let public_key = match PublicKey::from_bytes(&public_key_decoded[..]) {
        Ok(v) => v,
        Err(_) => {
            js_sys::Reflect::set(
                &js_verified,
                &"error".into(),
                &"Unable to parse Public Key".into(),
            )
            .unwrap();
            return js_verified;
        }
    };

    let mut signature_decoded = Vec::new();
    match base64::decode_config_buf(&signature, base64::URL_SAFE, &mut signature_decoded) {
        Ok(_) => (),
        Err(e) => {
            js_sys::Reflect::set(
                &js_verified,
                &"error".into(),
                &format!("Unable to parse Signature: {} {}", e, signature).into(),
            )
            .unwrap();
            return js_verified;
        }
    }

    let datetime_bytes = &signature_decoded[..DATETIME_LEN];
    let signature_bytes = &signature_decoded[DATETIME_LEN..];

    let signature = match Signature::from_bytes(signature_bytes) {
        Ok(v) => v,
        Err(e) => {
            js_sys::Reflect::set(
                &js_verified,
                &"error".into(),
                &format!("Error parsing signature: {}", e).into(),
            )
            .unwrap();
            return js_verified;
        }
    };

    let mut verifiable: Vec<u8> = Vec::new();
    verifiable.extend(datetime_bytes);
    verifiable.extend(message.as_bytes());

    let verified = public_key.verify(&verifiable[..], &signature);

    match verified {
        Ok(_) => {
            js_sys::Reflect::set(
                &js_verified,
                &"datetime".into(),
                &String::from_utf8(datetime_bytes.to_vec()).unwrap().into(),
            ).unwrap();
            js_sys::Reflect::set(&js_verified, &"verified".into(), &JsValue::from_bool(true))
                .unwrap()
        }
        Err(e) => {
            js_sys::Reflect::set(
                &js_verified,
                &"error".into(),
                &format!("Error validating signature: {}", e).into(),
            )
            .unwrap();
            js_sys::Reflect::set(&js_verified, &"verified".into(), &JsValue::from_bool(false))
                .unwrap()
        }
    };
    js_verified
}
