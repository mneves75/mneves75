# Project book release correction — 1.13.1

## What the review changed

Public production smoke found hover layout shifts above the existing 0.001 budget. A diagnostic confirmed the home row padding changed from 0 to 13.6 px and moved text rectangles. Removing the changing padding preserves default alignment, background highlight and arrow feedback. Reserving the inset in every state would change default alignment; using transforms would preserve unwanted text movement. A geometry assertion complements the existing CLS positive control and unchanged budget.

The 1.13.0 tags and Worker receipts remain historical evidence. This correction uses new 1.13.1 beta/production tags. No token rotation or valid new 50 ms measurement is implied. The original dirty performance/security checkout remains untouched.

Red control: observed featured text rectangles move on the live 1.13.0 page; strict geometry assertion exits 1. Local/CI gates, artifact acceptance and deployment receipts follow in the JSON when complete.

Local types, complete build with LASTMOD_CHECK and full route/browser tests exited 0. There are 110 outputs, 108 sitemap URLs and no changed significant dates. The strict hover/focus geometry guard and unchanged CLS budget passed. Focused adversarial plan/diff review found no blockers. Fresh full artifact acceptance and real-workerd smoke are running.
