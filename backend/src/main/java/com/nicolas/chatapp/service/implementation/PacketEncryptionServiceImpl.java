package com.nicolas.chatapp.service.implementation;

import com.nicolas.chatapp.config.EncryptionProperties;
import com.nicolas.chatapp.service.PacketEncryptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PacketEncryptionServiceImpl implements PacketEncryptionService {

    private final EncryptionProperties encryptionProperties;

    @Override
    public String encrypt(String plainText) {
        return Base64.getEncoder().encodeToString(applyXor(plainText.getBytes(StandardCharsets.UTF_8)));
    }

    @Override
    public String decrypt(String cipherText) {
        byte[] decoded = Base64.getDecoder().decode(cipherText);
        return new String(applyXor(decoded), StandardCharsets.UTF_8);
    }

    private byte[] applyXor(byte[] input) {
        byte[] secret = encryptionProperties.secret().getBytes(StandardCharsets.UTF_8);
        byte[] output = new byte[input.length];
        for (int i = 0; i < input.length; i++) {
            output[i] = (byte) (input[i] ^ secret[i % secret.length]);
        }
        return output;
    }
}
