# Trillium-webdav

[Trilium](https://github.com/zadam/trilium) was a hierarchical note taking application with focus on building large personal knowledge bases. And I have used for a long time. It support sync to a remote [trilium server](https://github.com/zadam/trilium/wiki/Server-installation). 

The sync mechanism is a nice feature to backup your data, but it's only support sync to trilium server. It's not sufficient for me, for this reason, I'm write this lite script to upload local trilium data to [jianguo cloud](https://www.jianguoyun.com/). 

This was very lite and no such error control information for use. but for theory, it shoud be work to other server support webdav protocol.

## Usage

Create a new note in trilium with Note type [JS backend](https://github.com/zadam/trilium/wiki/Code-notes) and name to what your want.

Copy the [webdav.js](webdav.js) to this note.

Click the Execute button when your want to upload to webdav server.
