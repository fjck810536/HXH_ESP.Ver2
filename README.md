# HXH_ESP.Ver2

《HUNTER×HUNTER》念能力心理測驗 Web 版重製。

## v1.0.0

正式版流程：

- 20 題原始測驗邏輯與 Q1 分支
- 單選／多選／是非題互動
- 六系 raw score 與各系理論最大值正規化
- winner 仍依原始 raw score 判定
- 水見式 Lv1–Lv3 結果演出
- 特質系 deterministic seed、異常效果池與最多兩個副系
- 六邊形六系傾向揭示
- 首頁「選項」可輸入／隨機 Seed，預覽六系 × Lv1–Lv3 水見式
- 手機優先、鎖定雙擊縮放與 Safari gesture

線上版本：
https://fjck810536.github.io/HXH_ESP.Ver2/

## 計分基準

各系理論最大值：

- 強化 520
- 操作 525
- 放出 520
- 具現化 525
- 變化 520
- 特質 520

百分比只用於效果強度與六邊形顯示；最終系別仍以 raw score 最高者決定。

## Development / QA

`experiments/` 保留水見式、六邊形、完整流程與 QA harness，作為後續 UI／效果調整與回歸測試用。

`qa/full-system-test` 為總測試分支。

## Reference

原始測驗文字與計分參數整理於 `ORIGINAL_TEST_REFERENCE.md`。此檔作為封存參考，不隨正式 UI 文案修改。
