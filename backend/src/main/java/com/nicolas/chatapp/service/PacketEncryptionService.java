package com.nicolas.chatapp.service;

public interface PacketEncryptionService {

    String encrypt(String plainText);

    String decrypt(String cipherText);
}
