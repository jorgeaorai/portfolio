# Entrada do portfólio

## Rotas

- `/`: quarto e seleção de experiência.
- `/metaverso`: experiência 3D que antes ocupava a rota raiz.

As rotas dos dispositivos ficam centralizadas em `lib/portfolio-routes.ts`.

## Pendente

O repositório ainda não possui uma rota de portfólio tradicional. Por isso, a opção do PC aparece desabilitada e informa “Portfólio em preparação”. Quando essa experiência existir, basta apontar `portfolio` para a rota real em `lib/portfolio-routes.ts`; nenhum conteúdo substituto foi inventado.

## Execução

```bash
pnpm dev
```

Acesse `http://localhost:3000`.
