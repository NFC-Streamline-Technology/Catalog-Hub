import type translate from '@assets/i18n/pt-BR.json'

// Tipo base de todas as traduções (estrutura completa do arquivo JSON)
export type I18nTranslations = typeof translate

export type GenericTranslations = I18nTranslations['generic']

export type PaginationTranslations = I18nTranslations['pagination']

export type HeaderTranslations = I18nTranslations['header']

export type DashboardTranslations = I18nTranslations['pages']['dashboard'] & {
  generic: GenericTranslations
}

export type ProductsTranslations = I18nTranslations['pages']['products'] & {
  generic: GenericTranslations
}
