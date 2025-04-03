import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 源文件路径
const sourcePath = path.resolve(__dirname, "dist", "template.html");
// 目标文件路径
const targetPath = path.resolve(__dirname, "index.html");

// 复制文件
fs.copyFile(sourcePath, targetPath, (err) => {
  if (err) {
    console.error("Error copying file:", err);
    return;
  }
  console.log("File copied successfully!");

  // 删除 dist 文件夹
  fs.rm(
    path.resolve(__dirname, "dist"),
    { recursive: true, force: true },
    (err) => {
      if (err) {
        console.error("Error removing dist folder:", err);
        return;
      }
      console.log("Dist folder removed successfully!");
    }
  );
});
