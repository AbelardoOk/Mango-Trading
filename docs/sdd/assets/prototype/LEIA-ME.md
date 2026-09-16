# Mango Trading — protótipo de interface

## Arquivos

- **mango-trading.html**: protótipo navegável. Abra no navegador, sem instalar nada. Use os botões da capa para explorar os perfis.
- **MangoTrading_Prototipo.pdf**: caderno de telas para consulta e anexação.
- **telas-png/**: 25 pranchas em alta resolução, prontas para inserir em slides e no documento.
- **telas-svg-editaveis/**: as mesmas pranchas, com formas e texto editáveis. Arraste um SVG para uma página do Figma para importar o mockup.

## Figma

Arquivo criado: https://www.figma.com/design/AYyzDCqYcjkXqJxGQHpaxv

O plano Starter atingiu o limite de chamadas durante a criação. O arquivo contém a visão geral e o mercado, além do início da tela de compra. **O conjunto completo está nos arquivos locais deste pacote.** Os SVGs podem ser importados; as interações permanecem disponíveis no HTML, pois SVGs e PNGs são estáticos.

## O que está representado

| Requisito da ERS | Telas / evidência |
| --- | --- |
| RF01–RF02 | Cadastro e login |
| RF03 | Área do jogador e área administrativa, com menus separados |
| RF04 | Listagem, cadastro, edição, confirmação de exclusão, ativação e desativação de ações |
| RF05 | Mercado com empresa, símbolo, preço, setor e busca |
| RF06–RF08 | Compra, venda, validações, total e atualização do saldo |
| RF09–RF11 | Carteira, preço médio, resultado, histórico e patrimônio |
| RF12 | Ranking por patrimônio total, com dados ilustrativos |
| RNF07–RNF08 | Contraste, rótulos, foco, estados textuais e adaptação ao celular |

Também foram desenhadas a consulta de usuários e a gestão de eventos mencionadas nos perfis/casos de uso da ERS. O motor de impacto dos eventos é um diferencial planejado.

## Como apresentar

1. Abra a capa e explique que todo o mercado e dinheiro são fictícios.
2. Entre como jogador e apresente visão geral → mercado → compra de 10 AURA3.
3. Mostre o saldo mudando de M$ 4.200,00 para M$ 3.780,00; a carteira passa de 80 para 90 AURA3, com preço médio de M$ 40,22.
4. Mostre carteira, histórico e ranking. O patrimônio permanece M$ 12.480,00 imediatamente após a compra, pois a cotação é a mesma.
5. Na área administrativa, cadastre SOLR3, edite seus dados e exclua a ação recém-criada. A listagem permite ativar e desativar.
6. No guia, apresente saldo insuficiente e carteira vazia. Termine com as pranchas de acessibilidade e cobertura.

Para uma apresentação curta, priorize as imagens **03, 04, 05, 08, 11, 12, 13, 14 e 21**. Use o restante como apoio ou apêndice.

## Legendas sugeridas para o documento

- Figura — Visão geral do jogador, com saldo, patrimônio, posições e acesso ao ranking.
- Figura — Mercado de ações fictícias, com busca por empresa/símbolo e filtro por setor.
- Figura — Compra e venda de ações, com quantidade, total, saldo projetado e validação.
- Figura — Carteira após a compra, com quantidade, preço médio, preço atual, valor e resultado.
- Figura — Fluxo administrativo de listagem, cadastro, edição e exclusão de ações.
- Figura — Adaptação da interface ao celular, com navegação inferior e cartões de ações.

## Planejamento e limites

- A base foi extraída de **Requisitos_Web_MangoTrading.pdf** e **ATIVIDADE_ ENTREGA DO PROTÓTIPO (ESQUELETO) (3).pdf**, fornecidos pela equipe.
- O enunciado menciona Canva. A solicitação da equipe especificou Figma; os arquivos PNG podem ser inseridos no Canva, nos slides ou no documento.
- O protótipo usa dados fictícios em memória. Recarregar a página restaura o cenário inicial. Não há autenticação real, banco de dados ou chamadas externas.
- O acesso demonstrativo de administrador serve para apresentar as telas. Na implementação final, papéis e permissões deverão ser conferidos no servidor por Spring Security.
- A ERS prevê negociação para o usuário comum. Essa permissão foi mantida; o CRUD do catálogo pertence ao administrador.
- Saldo inicial, senha mínima de exemplo, volatilidade e cotações são decisões ilustrativas. A ERS não define todos esses valores.
- **Regra proposta:** impedir exclusão de ações com posições/transações vinculadas e oferecer desativação para preservar o histórico. Deve ser validada pela equipe.
- O ranking e os gráficos são cenários ilustrativos. O formulário de eventos apresenta o planejamento; o motor de preços e a persistência de eventos serão implementados no back-end.
- Acessibilidade visual foi planejada e houve verificação de contraste e navegação. A conformidade final exige testar a aplicação implementada com teclado, leitor de tela e diferentes ampliações.
- Este conjunto cobre a interface da entrega. O código Spring Boot, camadas, persistência, configuração de segurança, diagrama de casos de uso e apresentação do grupo continuam sendo entregas separadas.

## Validação realizada

Compra com saldo insuficiente; compra válida e preço médio; venda com quantidade insuficiente; venda válida; cadastro, edição e exclusão; bloqueio de exclusão com vínculos; ausência de erros JavaScript nos fluxos testados; ausência de rolagem horizontal no mercado móvel; inspeção visual das pranchas e dos SVGs.

Integrantes conforme a ERS: Abelardo Palácios Ribeiro, Miguel Ribeiro Bernal e Giovana Gomes Pavese.
