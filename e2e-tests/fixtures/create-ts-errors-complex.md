Tests delete-rename-write order
<openlovable-delete path="src/main.tsx">
</openlovable-delete>
<openlovable-rename from="src/App.tsx" to="src/main.tsx">
</openlovable-rename>
<openlovable-write path="src/main.tsx" description="final main.tsx file.">
finalMainTsxFileWithError();
</openlovable-write>
EOM
