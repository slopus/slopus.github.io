import { registerSitePages } from './sitePagesChunk'
import * as sitePages from './sitePages'

// Tests render any page, and read the docs text, without loading them first.
registerSitePages(sitePages)
