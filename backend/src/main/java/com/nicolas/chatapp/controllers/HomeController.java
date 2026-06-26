package com.nicolas.chatapp.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping({"/", "/app", "/signin", "/signup", "/admin/signin", "/admin/dashboard"})
    public String home() {
        return "forward:/index.html";
    }
}
