package com.nicolas.chatapp.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;

public record LoginRequestDTO(@JsonAlias({"email", "identifier", "loginIdentifier"}) String account,
                              String password) {
}
