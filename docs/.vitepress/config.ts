import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

export default defineConfig({
  title: 'ws-leptos-next',
  description: 'Documentação técnica: biblioteca de componentes e runtime nativo para Leptos.',
  lang: 'pt-BR',
  cleanUrls: true,

  // Gera llms.txt e llms-full.txt no build
  vite: {
    plugins: [llmstxt()],
  },

  srcExclude: ['decisions/template.md'],

  themeConfig: {
    nav: [
      { text: 'Guia', link: '/guide/getting-started' },
      { text: 'Projeto', link: '/project/vision' },
      { text: 'UI', link: '/ui/overview' },
      { text: 'Press', link: '/press/overview' },
      { text: 'Native', link: '/native/overview' },
      { text: 'Decisões', link: '/decisions/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guia',
          items: [
            { text: 'Primeiros passos', link: '/guide/getting-started' },
            { text: 'Monorepo (Moon)', link: '/guide/monorepo' },
            { text: 'Convenções', link: '/guide/conventions' },
            { text: 'Armadilhas conhecidas', link: '/guide/pitfalls' },
            { text: 'Referências (Quasar…)', link: '/guide/references' },
          ],
        },
      ],

      '/project/': [
        {
          text: 'Projeto',
          items: [
            { text: 'Visão e escopo', link: '/project/vision' },
            { text: 'Planos de implementação', link: '/project/plans' },
          ],
        },
      ],

      '/ui/': [
        {
          text: 'UI',
          items: [
            { text: 'Visão geral', link: '/ui/overview' },
            { text: 'Formulários (Form › Field › Input)', link: '/ui/forms' },
          ],
        },
      ],

      '/press/': [
        {
          text: 'leptos-press',
          items: [{ text: 'Visão geral', link: '/press/overview' }],
        },
      ],

      '/native/': [
        {
          text: 'Native',
          items: [{ text: 'Visão geral e spike', link: '/native/overview' }],
        },
      ],

      '/decisions/': [
        {
          text: 'Decisões (ADR)',
          items: [
            { text: 'Índice', link: '/decisions/' },
            { text: '0001 — Monorepo Moon', link: '/decisions/0001-monorepo-moon' },
            { text: '0002 — Docs como fonte única', link: '/decisions/0002-docs-fonte-unica' },
            { text: '0003 — Quasar como referência', link: '/decisions/0003-quasar-como-referencia' },
            { text: '0004 — Form › Field › Input', link: '/decisions/0004-ordem-form-field-input' },
            { text: '0005 — Entrega do CSS', link: '/decisions/0005-entrega-do-css' },
            { text: '0006 — leptos-press', link: '/decisions/0006-leptos-press' },
            { text: '0007 — Press: CSR e SSG', link: '/decisions/0007-press-csr-e-ssg' },
            { text: '0008 — Nome leptos-nebula', link: '/decisions/0008-nome-leptos-nebula' },
            { text: '0009 — Repositórios e submódulos', link: '/decisions/0009-repositorios-e-submodulos' },
          ],
        },
      ],
    },

    search: {
      provider: 'local',
    },
  },
})
