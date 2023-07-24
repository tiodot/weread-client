# 基于Tauri简单封装的微信阅读Mac的客户端 

使用方式：
1. 本地构建 **yarn build**
2. 下载已构建的版本，本地安装

快捷键说明：
> 具体实现在 src-tauri/inject/event.js 中

1. j：往下滚动 120px；
2. J：往下滚动 5 * 120px；
3. 1-9j：往下滚动 num * 120px；
4. k： 往上滚动 120px；
5. K： 往上滚动 5 * 120px；
6. 1-9k：往上滚动 num * 120px；
7. G： 滚动到底部
8. gg： 滚动到顶部
9. n： 下一章
10. p： 上一章
11. command + b：回到书架
12. command + [：后退
13. command + ]：前进


可以结合 raycast设置一个全局启动的快捷键，如果没使用raycast 也可修改 main.rs 添加一个快捷键
