# Discourse Graphs

The Discourse Graph extension enables Roam users to seamlessly add additional semantic structure to their notes, including specified page types and link types that model scientific discourse, to enable more complex and structured knowledge synthesis work, such as a complex interdisciplinary literature review, and enhanced collaboration with others on this work.

For more information about Discourse Graphs, check out our website at [https://discoursegraphs.com](https://discoursegraphs.com)

## Table of Contents

**WIP** as we transition from the Query Builder plugin to the new Discourse Graphs extension.

- [Query Builder](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#roamjs-query-builder)
  - [Query Blocks](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#query-blocks)
  - [Query Pages](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#query-pages)
  - [Query Drawer](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#query-drawer)
  - [Usage](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#usage)
  - [Conditions](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#conditions)
  - [Selections](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#selections)
  - [Manipulating Results](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#manipulating-results)
  - [Layouts](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#layouts)
  - [Exporting](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#exporting)
  - [Styling](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#styling)
  - [SmartBlocks Integration](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#smartblocks-integration)
  - [Developer API](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#developer-api)
  - [Examples](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/query-builder.md#examples)
- [Discourse Graphs](https://github.com/DiscourseGraphs/discourse-graph/blob/main/docs/discourse-graphs.md)

## Nomenclature

There are some important terms to know and have exact definitions on since they will be used throughout the docs.

- `Page` - A Page is anything in Roam that was created with `[[brackets]]`, `#hashtag`, `#[[hashtag with brackets]]`, or `Attribute::`. Clicking on these links in your graph takes you to its designated page, each with its own unique title, and they have no parent.
- `Block` - A bullet or line of text in Roam. While you can also go to pages that have a zoomed in block view, their content is not unique, and they always have one parent.
- `Node` - A superset of `Block`s and `Page`s.

## Load Extension

While in development, you can load the extension by using the `Load Developer Extensions from URL` option:

https://www.discoursegraphs.com/releases/roam-discourse-graph

![image](https://github.com/user-attachments/assets/60bf48ae-ec94-4581-9ae3-8af90fb7bb88)

![image](https://github.com/user-attachments/assets/a890641d-1f6a-47a6-aceb-e18fda388b5d)