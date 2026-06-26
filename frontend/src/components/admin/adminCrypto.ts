const SECRET = "Yijia-Campus-Chat-Packet-Secret";

export const decryptBroadcastPacket = async (cipherText: string) => {
    const binary = Uint8Array.from(atob(cipherText), (char) => char.charCodeAt(0));
    const secret = new TextEncoder().encode(SECRET);
    const output = binary.map((value, index) => value ^ secret[index % secret.length]);
    return new TextDecoder().decode(output);
};

