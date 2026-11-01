package com.mangotrading.mangotrading.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TiktokLoginRequest {

    @NotBlank(message = "Código do TikTok é obrigatório")
    private String code;

    @NotBlank(message = "URL de redirecionamento é obrigatória")
    private String redirectUri;
}
