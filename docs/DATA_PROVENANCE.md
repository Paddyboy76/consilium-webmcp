# Data and advisor provenance

All persona, journal, action, and goal records are original synthetic fiction created for this challenge. They represent no real person.

Advisor evidence uses narrow canonical excerpts from three verified public-domain editions: Meric Casaubon's 1634/1635 *Meditations* via Project Gutenberg #2680, George Long's 1877 *Encheiridion* via #10661, and Lionel Giles's 1910 *Art of War* via #132. Each manifest records edition, translator, public-domain basis, canonical URL, doctrine boundary, stable locators, and SHA-256 of the packaged canonical excerpt file. Automated integrity tests require every runtime excerpt and locator to equal its manifest/canonical file. Jurisdiction outside the USA must be checked. No production/private advisor library was copied.

The recovery runtime expands the bounded packs from 2 to 6 passages per advisor (18 total). The original six remain checksum-bound to the packaged canonical excerpt files; twelve additions are exact primary-text selections acquired from the same Project Gutenberg editions on 2026-09-02 and carry edition/section locators plus deterministic edition-locator hashes. Boilerplate and commentator prose are excluded. This is a selected passage corpus, not a full-book corpus. Production ingestion creates 18 advisor vectors plus 96 synthetic personal-event vectors: 114 total.

`sources/provenance.json` separately records per-edition US public-domain reasoning, raw excerpt-acquisition hashes, normalized canonical hashes, the deterministic normalization rule, and exclusions. Gutenberg license/trademark boilerplate, navigation, generated summaries, and editorial commentary are not advisor evidence.
