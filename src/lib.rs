use ed25519_dalek::Keypair;
use ed25519_dalek::Signature;
use ed25519_dalek::PublicKey;
use rand::rngs::OsRng;

fn main() {
    let mut csprng: OsRng = OsRng::new().unwrap();
    let keypair: Keypair = Keypair::generate(&mut csprng);

    let message: &[u8] = b"This message is signed.";
    let signature: Signature = keypair.sign(message);

    assert!(keypair.verify(message, &signature).is_ok());

    let public_key: PublicKey = keypair.public;
    assert!(public_key.verify(message, &signature).is_ok());
}
