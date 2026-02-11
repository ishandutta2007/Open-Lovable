# Custom Chat Message Indicators

The `<openlovable-status>` tag in chat messages renders as a collapsible status indicator box. Use it for system messages like compaction notifications:

```
<openlovable-status title="My Title" state="finished">
Content here
</openlovable-status>
```

Valid states: `"finished"`, `"in-progress"`, `"aborted"`
