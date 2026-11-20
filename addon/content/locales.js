(() => {
  const translationLanguages = [
    ["en", "English"],
    ["zh-CN", "简体中文"],
    ["zh-TW", "繁體中文"],
    ["ja", "日本語"],
    ["ko", "한국어"],
    ["fr", "Français"],
    ["de", "Deutsch"],
    ["ru", "Русский"],
    ["es", "Español"],
    ["it", "Italiano"],
    ["pt", "Português"],
  ];
  const additionalLocales = ["zh-TW", "ja", "ko", "fr", "de", "ru"];
  const interfaceLanguages = ["zh-CN", "en", ...additionalLocales]
    .map(id => translationLanguages.find(([code]) => code === id));

  // Each row follows the order of additionalLocales. English keys match the call sites.
  const messages = {
    "New chat": ["新對話", "新しいチャット", "새 대화", "Nouvelle discussion", "Neuer Chat", "Новый чат"],
    "Settings": ["設定", "設定", "설정", "Paramètres", "Einstellungen", "Настройки"],
    "History": ["歷史", "履歴", "기록", "Historique", "Verlauf", "История"],
    "Loading history…": [
      "正在讀取歷史…", "履歴を読み込み中…", "기록을 불러오는 중…",
      "Chargement de l’historique…", "Verlauf wird geladen…", "Загрузка истории…",
    ],
    "No saved results for this scope yet.": [
      "目前範圍尚無歷史記錄。", "この範囲には保存済みの結果がありません。", "이 범위에 저장된 결과가 없습니다.",
      "Aucun résultat enregistré pour cette sélection.", "Für diese Auswahl sind noch keine Ergebnisse gespeichert.",
      "Для этой выборки пока нет сохранённых результатов.",
    ],
    "Loaded a saved result.": [
      "已使用歷史結果。", "保存済みの結果を読み込みました。", "저장된 결과를 불러왔습니다.",
      "Résultat enregistré chargé.", "Gespeichertes Ergebnis geladen.", "Загружен сохранённый результат.",
    ],
    "Could not load history.": [
      "無法讀取歷史記錄。", "履歴を読み込めませんでした。", "기록을 불러올 수 없습니다.",
      "Impossible de charger l’historique.", "Der Verlauf konnte nicht geladen werden.", "Не удалось загрузить историю.",
    ],
    "Analysis complete. Could not save it to history.": [
      "分析完成，但無法儲存至歷史記錄。", "分析は完了しましたが、履歴に保存できませんでした。", "분석은 완료되었으나 기록에 저장할 수 없습니다.",
      "Analyse terminée. Impossible de l’enregistrer dans l’historique.",
      "Analyse abgeschlossen. Sie konnte nicht im Verlauf gespeichert werden.",
      "Анализ завершён. Не удалось сохранить его в истории.",
    ],
    "This analysis is already running.": [
      "相同的分析正在執行。", "同じ分析を実行中です。", "같은 분석이 이미 실행 중입니다.",
      "Cette analyse est déjà en cours.", "Diese Analyse läuft bereits.", "Этот анализ уже выполняется.",
    ],
    "Local history": ["本機歷史", "ローカル履歴", "로컬 기록", "Historique local", "Lokaler Verlauf", "Локальная история"],
    "Keep history for days": [
      "歷史保留天數", "履歴の保存日数", "기록 보관 일수",
      "Durée de conservation en jours", "Aufbewahrungsdauer in Tagen", "Срок хранения в днях",
    ],
    "Delete all local history": [
      "刪除所有本機歷史", "ローカル履歴をすべて削除", "모든 로컬 기록 삭제",
      "Supprimer tout l’historique local", "Gesamten lokalen Verlauf löschen", "Удалить всю локальную историю",
    ],
    "Delete all locally saved analysis history?": [
      "確定刪除所有本機分析紀錄？", "ローカルに保存した分析履歴をすべて削除しますか？", "로컬에 저장된 분석 기록을 모두 삭제할까요?",
      "Supprimer tout l’historique des analyses enregistré localement ?",
      "Gesamten lokal gespeicherten Analyseverlauf löschen?", "Удалить всю локально сохранённую историю анализа?",
    ],
    "Local history deleted.": [
      "已刪除本機歷史。", "ローカル履歴を削除しました。", "로컬 기록을 삭제했습니다.",
      "Historique local supprimé.", "Lokaler Verlauf gelöscht.", "Локальная история удалена.",
    ],
    "Could not delete local history.": [
      "無法刪除本機歷史。", "ローカル履歴を削除できませんでした。", "로컬 기록을 삭제할 수 없습니다.",
      "Impossible de supprimer l’historique local.", "Der lokale Verlauf konnte nicht gelöscht werden.", "Не удалось удалить локальную историю.",
    ],
    "Enter a positive whole number of days.": [
      "請輸入大於零的整數天數。", "1 日以上の整数を入力してください。", "일수를 양의 정수로 입력하세요.",
      "Indiquez un nombre entier positif de jours.", "Geben Sie eine positive ganze Anzahl von Tagen ein.", "Введите положительное целое число дней.",
    ],
    "Settings saved. Could not remove expired history.": [
      "已儲存設定，但無法清除過期歷史。", "設定を保存しましたが、期限切れの履歴は削除できませんでした。", "설정을 저장했지만 만료된 기록을 삭제하지 못했습니다.",
      "Paramètres enregistrés. Impossible de supprimer l’historique arrivé à expiration.",
      "Einstellungen gespeichert. Abgelaufener Verlauf konnte nicht gelöscht werden.", "Настройки сохранены. Не удалось удалить просроченные записи.",
    ],
    "Add as note": ["新增為筆記", "ノートとして追加", "노트로 추가", "Ajouter comme note", "Als Notiz hinzufügen", "Добавить как заметку"],
    "Note added": ["已新增筆記", "ノートを追加しました", "노트 추가됨", "Note ajoutée", "Notiz hinzugefügt", "Заметка добавлена"],
    "Saved as a Zotero note.": [
      "已儲存為 Zotero 筆記。", "Zotero のノートとして保存しました。", "Zotero 노트로 저장했습니다.",
      "Enregistré comme note Zotero.", "Als Zotero-Notiz gespeichert.", "Сохранено как заметка Zotero.",
    ],
    "This paper cannot accept a note. Check the item and library permissions.": [
      "無法新增筆記。請檢查項目與書目庫權限。", "ノートを追加できません。項目とライブラリの権限を確認してください。",
      "노트를 추가할 수 없습니다. 항목과 라이브러리 권한을 확인하세요.",
      "Impossible d’ajouter une note. Vérifiez le document et les droits de la bibliothèque.",
      "Eine Notiz kann nicht hinzugefügt werden. Prüfen Sie den Eintrag und die Bibliotheksrechte.",
      "Не удалось добавить заметку. Проверьте запись и права доступа к библиотеке.",
    ],
    "Close": ["關閉", "閉じる", "닫기", "Fermer", "Schließen", "Закрыть"],
    "Chat messages": ["對話訊息", "チャットのメッセージ", "대화 메시지", "Messages de la discussion", "Chatnachrichten", "Сообщения чата"],
    "Ask a question…": ["輸入問題…", "質問を入力…", "질문을 입력하세요…", "Posez une question…", "Eine Frage stellen…", "Задайте вопрос…"],
    "Your question": ["輸入問題", "質問", "질문", "Votre question", "Ihre Frage", "Ваш вопрос"],
    "Send": ["送出", "送信", "보내기", "Envoyer", "Senden", "Отправить"],
    "Stop": ["停止", "停止", "중지", "Arrêter", "Anhalten", "Остановить"],
    "LLM Paper Chat · Research chat": [
      "LLM Paper Chat · 文獻對話", "LLM Paper Chat · 文献チャット", "LLM Paper Chat · 문헌 대화",
      "LLM Paper Chat · Discussion sur les articles", "LLM Paper Chat · Literaturchat", "LLM Paper Chat · Чат по статьям",
    ],
    "Open LLM Paper Chat": [
      "開啟 LLM Paper Chat", "LLM Paper Chat を開く", "LLM Paper Chat 열기",
      "Ouvrir LLM Paper Chat", "LLM Paper Chat öffnen", "Открыть LLM Paper Chat",
    ],
    "Paper": ["文獻", "論文", "논문", "Article", "Publikation", "Статья"],
    "Collection": ["資料夾", "コレクション", "컬렉션", "Collection", "Sammlung", "Коллекция"],
    ", ": ["、", "、", ", ", ", ", ", ", ", "],
    "Whole collection": ["整個資料夾", "コレクション全体", "전체 컬렉션", "Toute la collection", "Ganze Sammlung", "Вся коллекция"],
    "Current paper": ["目前文獻", "現在の論文", "현재 논문", "Article actuel", "Aktuelle Publikation", "Текущая статья"],
    "General chat": ["一般對話", "一般チャット", "일반 대화", "Discussion générale", "Allgemeiner Chat", "Общий чат"],
    "Summarize": ["論文摘要", "要約", "논문 요약", "Résumer", "Zusammenfassen", "Резюме статьи"],
    "Translate PDF": ["單語原位翻譯", "翻訳版 PDF", "단일 언어 PDF 번역", "Traduire le PDF", "PDF übersetzen", "Перевести PDF"],
    "Translate bilingual PDF": [
      "雙語原位翻譯", "対訳版 PDF", "이중 언어 PDF 번역", "Créer un PDF bilingue",
      "Zweisprachiges PDF erstellen", "Создать двуязычный PDF",
    ],
    "Review": ["文獻綜述", "文献レビュー", "문헌 검토", "Revue de littérature", "Literaturübersicht", "Обзор литературы"],
    "Findings and Limitations": [
      "研究發現與限制", "知見と限界", "연구 결과와 한계", "Résultats et limites", "Ergebnisse und Einschränkungen", "Результаты и ограничения",
    ],
    "Research gaps": ["研究缺口", "研究上の空白", "연구 공백", "Lacunes de la recherche", "Forschungslücken", "Пробелы в исследованиях"],
    "Set up BabelDOC in Settings to translate full PDFs.": [
      "請在設定中配置 BabelDOC 以翻譯整份 PDF。", "PDF 全体を翻訳するには、設定で BabelDOC を指定してください。",
      "전체 PDF를 번역하려면 설정에서 BabelDOC를 구성하세요.", "Configurez BabelDOC dans les paramètres pour traduire des PDF entiers.",
      "Richten Sie BabelDOC in den Einstellungen ein, um ganze PDFs zu übersetzen.", "Настройте BabelDOC, чтобы переводить PDF целиком.",
    ],
    "Ask a question or summarize this paper.": [
      "可以提問或摘要目前文獻。", "論文について質問するか、要約を作成できます。", "논문에 대해 질문하거나 요약하세요.",
      "Posez une question ou résumez cet article.", "Stellen Sie eine Frage oder fassen Sie diese Publikation zusammen.",
      "Задайте вопрос или составьте резюме статьи.",
    ],
    "Ask about this collection or choose an analysis.": [
      "可針對目前資料夾提問或選擇分析。", "コレクションについて質問するか、分析を選択してください。",
      "컬렉션에 대해 질문하거나 분석을 선택하세요.", "Posez une question sur cette collection ou choisissez une analyse.",
      "Stellen Sie eine Frage zur Sammlung oder wählen Sie eine Analyse.", "Задайте вопрос о коллекции или выберите анализ.",
    ],
    "Select a paper or collection, or start a chat.": [
      "選取一篇文獻或一個資料夾，或直接開始對話。", "論文やコレクションを選ぶか、チャットを開始してください。",
      "논문이나 컬렉션을 선택하거나 대화를 시작하세요.", "Sélectionnez un article ou une collection, ou lancez une discussion.",
      "Wählen Sie eine Publikation oder Sammlung oder starten Sie einen Chat.", "Выберите статью или коллекцию либо начните чат.",
    ],
    "Custom provider": [
      "自訂服務", "カスタムプロバイダー", "사용자 지정 제공업체", "Fournisseur personnalisé", "Benutzerdefinierter Anbieter", "Свой поставщик",
    ],
    "Copy": ["複製", "コピー", "복사", "Copier", "Kopieren", "Копировать"],
    "Copied": ["已複製", "コピーしました", "복사됨", "Copié", "Kopiert", "Скопировано"],
    "Open PDF": ["開啟 PDF", "PDF を開く", "PDF 열기", "Ouvrir le PDF", "PDF öffnen", "Открыть PDF"],
    "Review topic": ["綜述主題", "レビューのテーマ", "문헌 검토 주제", "Sujet de la revue", "Thema der Übersicht", "Тема обзора"],
    "Review topic: ": ["綜述主題：", "レビューのテーマ：", "문헌 검토 주제: ", "Sujet de la revue : ", "Thema der Übersicht: ", "Тема обзора: "],
    "Leave blank to let the model choose": [
      "留空讓模型決定", "空欄の場合はモデルが選択", "비워 두면 모델이 주제를 선택합니다", "Laissez vide pour laisser le modèle choisir",
      "Leer lassen, damit das Modell wählt", "Оставьте пустым, чтобы модель выбрала тему",
    ],
    "Start review": ["開始綜述", "レビューを開始", "검토 시작", "Lancer la revue", "Übersicht erstellen", "Начать обзор"],
    "Cancel": ["取消", "キャンセル", "취소", "Annuler", "Abbrechen", "Отмена"],
    "Preparing the source PDF…": [
      "正在準備原文 PDF…", "元の PDF を準備中…", "원본 PDF 준비 중…", "Préparation du PDF source…",
      "Quell-PDF wird vorbereitet…", "Подготовка исходного PDF…",
    ],
    "Preparing research context…": [
      "正在準備文獻內容…", "文献情報を準備中…", "문헌 정보 준비 중…", "Préparation des sources…",
      "Quellen werden vorbereitet…", "Подготовка материалов…",
    ],
    "The translated PDF was added to Zotero.": [
      "譯文已加入 Zotero。", "翻訳した PDF を Zotero に追加しました。", "번역된 PDF를 Zotero에 추가했습니다.",
      "Le PDF traduit a été ajouté à Zotero.", "Das übersetzte PDF wurde zu Zotero hinzugefügt.", "Переведённый PDF добавлен в Zotero.",
    ],
    "Done": ["完成", "完了", "완료", "Terminé", "Fertig", "Готово"],
    "Sources: ": ["本次依據：", "参照資料：", "참고 자료: ", "Sources : ", "Quellen: ", "Источники: "],
    "Stopped.": ["已停止。", "停止しました。", "중지했습니다.", "Arrêté.", "Angehalten.", "Остановлено."],
    "Stopped": ["已停止", "停止済み", "중지됨", "Arrêté", "Angehalten", "Остановлено"],
    "Request failed": ["請求失敗", "リクエスト失敗", "요청 실패", "Échec de la requête", "Anfrage fehlgeschlagen", "Сбой запроса"],
    "Interface language": ["介面語言", "表示言語", "인터페이스 언어", "Langue de l’interface", "Oberflächensprache", "Язык интерфейса"],
    "Model API": ["模型 API", "モデル API", "모델 API", "API du modèle", "Modell-API", "API модели"],
    "Provider": ["服務", "プロバイダー", "제공업체", "Fournisseur", "Anbieter", "Поставщик"],
    "Custom (OpenAI-compatible)": [
      "自訂（相容 OpenAI）", "カスタム（OpenAI 互換）", "사용자 지정 (OpenAI 호환)",
      "Personnalisé (compatible OpenAI)", "Benutzerdefiniert (OpenAI-kompatibel)", "Свой (совместимый с OpenAI)",
    ],
    "API URL": ["API 位址", "API URL", "API URL", "URL de l’API", "API-URL", "URL API"],
    "Model ID": ["模型 ID", "モデル ID", "모델 ID", "Identifiant du modèle", "Modell-ID", "Идентификатор модели"],
    "API key": ["API 金鑰", "API キー", "API 키", "Clé API", "API-Schlüssel", "Ключ API"],
    "Claude workspace ID (optional)": [
      "Claude 工作區 ID（選填）", "Claude ワークスペース ID（任意）", "Claude 작업 공간 ID (선택 사항)",
      "ID de l’espace de travail Claude (facultatif)", "Claude-Arbeitsbereich-ID (optional)", "ID рабочей области Claude (необязательно)",
    ],
    "Response mode": ["回覆顯示", "回答の表示方法", "응답 표시 방식", "Mode de réponse", "Antwortmodus", "Режим ответа"],
    "Streaming": ["串流", "ストリーミング", "스트리밍", "En continu", "Streaming", "Потоковый"],
    "Full response": ["完整回覆", "回答を一括表示", "전체 응답", "Réponse complète", "Vollständige Antwort", "Полный ответ"],
    "Test connection": ["測試連線", "接続テスト", "연결 테스트", "Tester la connexion", "Verbindung testen", "Проверить подключение"],
    "Translation": ["翻譯", "翻訳", "번역", "Traduction", "Übersetzung", "Перевод"],
    "Custom…": ["自訂…", "カスタム…", "사용자 지정…", "Personnalisé…", "Benutzerdefiniert…", "Свой вариант…"],
    "Source language": ["來源語言", "翻訳元の言語", "원문 언어", "Langue source", "Ausgangssprache", "Язык оригинала"],
    "Target language": ["目標語言", "翻訳先の言語", "번역 언어", "Langue cible", "Zielsprache", "Язык перевода"],
    "Custom source language code": [
      "自訂來源語言代碼", "翻訳元の言語コード", "사용자 지정 원문 언어 코드", "Code de la langue source",
      "Benutzerdefinierter Ausgangssprachcode", "Код языка оригинала",
    ],
    "Custom target language code": [
      "自訂目標語言代碼", "翻訳先の言語コード", "사용자 지정 번역 언어 코드", "Code de la langue cible",
      "Benutzerdefinierter Zielsprachcode", "Код языка перевода",
    ],
    "PDF text selection": ["PDF 選取文字", "PDF の選択テキスト", "PDF 텍스트 선택", "Texte sélectionné dans le PDF", "Textauswahl im PDF", "Выделенный текст в PDF"],
    "Click to translate": ["點擊翻譯", "クリックして翻訳", "클릭하여 번역", "Cliquer pour traduire", "Zum Übersetzen klicken", "Перевести по нажатию"],
    "Translate automatically": ["自動翻譯", "自動翻訳", "자동 번역", "Traduire automatiquement", "Automatisch übersetzen", "Переводить автоматически"],
    "Off": ["關閉", "オフ", "끄기", "Désactivé", "Aus", "Выключено"],
    "Local BabelDOC executable (optional)": [
      "本機 BabelDOC 執行檔（選填）", "BabelDOC の実行ファイル（任意）", "로컬 BabelDOC 실행 파일 (선택 사항)",
      "Exécutable local BabelDOC (facultatif)", "Lokale BabelDOC-Programmdatei (optional)", "Исполняемый файл BabelDOC (необязательно)",
    ],
    "Choose file…": ["選擇檔案…", "ファイルを選択…", "파일 선택…", "Choisir un fichier…", "Datei auswählen…", "Выбрать файл…"],
    "Choose the BabelDOC executable": [
      "選擇 BabelDOC 執行檔", "BabelDOC の実行ファイルを選択", "BabelDOC 실행 파일 선택",
      "Choisir l’exécutable BabelDOC", "BabelDOC-Programmdatei auswählen", "Выберите исполняемый файл BabelDOC",
    ],
    "Executables": ["執行檔", "実行ファイル", "실행 파일", "Fichiers exécutables", "Programmdateien", "Исполняемые файлы"],
    "Could not open the file picker. Paste the full executable path.": [
      "無法開啟檔案選擇器，請貼上完整路徑。", "ファイルを選択できませんでした。実行ファイルのフルパスを貼り付けてください。",
      "파일 선택기를 열 수 없습니다. 실행 파일의 전체 경로를 붙여넣으세요.",
      "Impossible d’ouvrir le sélecteur. Collez le chemin complet de l’exécutable.",
      "Die Dateiauswahl konnte nicht geöffnet werden. Fügen Sie den vollständigen Programmpfad ein.",
      "Не удалось открыть выбор файла. Вставьте полный путь к исполняемому файлу.",
    ],
    "After installation, select babeldoc.exe on Windows or babeldoc on other systems. Chat and selection translation work with this field blank.": [
      "安裝後請選擇 babeldoc.exe（Windows）或 babeldoc。留空仍可問答及翻譯所選文字。",
      "インストール後に、Windows では babeldoc.exe、それ以外では babeldoc を選択してください。空欄でもチャットと選択したテキストの翻訳は使えます。",
      "설치 후 Windows에서는 babeldoc.exe를, 다른 운영체제에서는 babeldoc를 선택하세요. 이 항목이 비어 있어도 대화와 선택 번역을 사용할 수 있습니다.",
      "Après l’installation, sélectionnez babeldoc.exe sous Windows ou babeldoc sur les autres systèmes. La discussion et la traduction du texte sélectionné fonctionnent même si ce champ est vide.",
      "Wählen Sie nach der Installation babeldoc.exe unter Windows beziehungsweise babeldoc unter anderen Systemen. Chat und Übersetzung von Textauswahlen funktionieren auch bei leerem Feld.",
      "После установки выберите babeldoc.exe в Windows или babeldoc в других системах. Чат и перевод выделенного текста доступны и при пустом поле.",
    ],
    "PDF translation requests per second": [
      "PDF 翻譯每秒請求數", "PDF 翻訳の秒間リクエスト数", "PDF 번역의 초당 요청 수", "Requêtes de traduction PDF par seconde",
      "PDF-Übersetzungsanfragen pro Sekunde", "Запросов перевода PDF в секунду",
    ],
    "Research": ["文獻分析", "文献分析", "문헌 분석", "Analyse des articles", "Literaturanalyse", "Анализ литературы"],
    "Summary template": ["論文摘要範本", "要約テンプレート", "논문 요약 템플릿", "Modèle de résumé", "Zusammenfassungsvorlage", "Шаблон резюме"],
    "Source character limit per request": [
      "每次請求的文獻字數上限", "リクエストごとの文献文字数上限", "요청당 문헌 글자 수 제한", "Limite de caractères des sources par requête",
      "Zeichenlimit für Quellen pro Anfrage", "Лимит символов источников на запрос",
    ],
    "Response token limit": [
      "回覆 Token 上限", "回答トークンの上限", "응답 토큰 제한", "Limite de jetons de la réponse", "Tokenlimit für die Antwort", "Лимит токенов ответа",
    ],
    "Save": ["儲存", "保存", "저장", "Enregistrer", "Speichern", "Сохранить"],
    "Chat and translation send the needed text to the selected provider.": [
      "對話及翻譯會將所需文字送給所選服務。", "チャットや翻訳に必要なテキストは、選択したプロバイダーに送信されます。",
      "대화와 번역에 필요한 텍스트는 선택한 제공업체에 전송됩니다.",
      "La discussion et la traduction envoient le texte nécessaire au fournisseur choisi.",
      "Für Chat und Übersetzung wird der benötigte Text an den gewählten Anbieter gesendet.",
      "Чат и перевод отправляют необходимый текст выбранному поставщику.",
    ],
    "Testing…": ["測試中…", "テスト中…", "테스트 중…", "Test en cours…", "Verbindungstest läuft…", "Проверка…"],
    "Connected": ["連線成功", "接続成功", "연결 성공", "Connexion réussie", "Verbunden", "Подключено"],
    "Connection test timed out. Check your network and Zotero proxy settings.": [
      "測試逾時，請檢查網路和 Zotero 的代理伺服器設定。", "接続テストがタイムアウトしました。ネットワークと Zotero のプロキシ設定を確認してください。",
      "연결 테스트 시간이 초과되었습니다. 네트워크와 Zotero 프록시 설정을 확인하세요.",
      "Le test de connexion a expiré. Vérifiez le réseau et les paramètres de proxy de Zotero.",
      "Zeitüberschreitung beim Test. Prüfen Sie das Netzwerk und die Proxy-Einstellungen von Zotero.",
      "Время проверки истекло. Проверьте сеть и настройки прокси Zotero.",
    ],
    "Enter a custom language code or select a language from the list.": [
      "請輸入自訂語言代碼或從清單中選擇語言。", "言語コードを入力するか、一覧から言語を選択してください。",
      "사용자 지정 언어 코드를 입력하거나 목록에서 언어를 선택하세요.",
      "Saisissez un code de langue ou choisissez une langue dans la liste.",
      "Geben Sie einen Sprachcode ein oder wählen Sie eine Sprache aus der Liste.",
      "Введите код языка или выберите язык из списка.",
    ],
    "Settings saved": ["設定已儲存", "設定を保存しました", "설정을 저장했습니다", "Paramètres enregistrés", "Einstellungen gespeichert", "Настройки сохранены"],
    "Translate selection": [
      "翻譯所選文字", "選択箇所を翻訳", "선택한 텍스트 번역", "Traduire la sélection", "Auswahl übersetzen", "Перевести выделенный текст",
    ],
    "Translation result": ["翻譯結果", "翻訳結果", "번역 결과", "Résultat de la traduction", "Übersetzung", "Результат перевода"],
    "Copy translation": ["複製翻譯結果", "翻訳をコピー", "번역 복사", "Copier la traduction", "Übersetzung kopieren", "Копировать перевод"],
    "Select a shorter passage.": [
      "請選取較短的段落。", "より短い範囲を選択してください。", "더 짧은 구절을 선택하세요.", "Sélectionnez un passage plus court.",
      "Wählen Sie einen kürzeren Abschnitt.", "Выделите более короткий фрагмент.",
    ],
    "Translating…": ["翻譯中…", "翻訳中…", "번역 중…", "Traduction en cours…", "Übersetzung läuft…", "Перевод…"],
    "PDF excerpts": ["PDF 摘錄", "PDF の抜粋", "PDF 발췌", "Extraits du PDF", "PDF-Auszüge", "Фрагменты PDF"],
    "Full PDF text": ["PDF 全文", "PDF の全文", "PDF 전문", "Texte intégral du PDF", "PDF-Volltext", "Полный текст PDF"],
    "Abstract": ["摘要", "抄録", "초록", "Résumé", "Abstract", "Аннотация"],
    "Bibliographic metadata": ["書目資料", "書誌情報", "서지 정보", "Données bibliographiques", "Bibliografische Metadaten", "Библиографические данные"],
    "The selected collection has no papers to analyze.": [
      "所選資料夾沒有可分析的文獻。", "選択したコレクションには分析できる論文がありません。", "선택한 컬렉션에 분석할 논문이 없습니다.",
      "La collection sélectionnée ne contient aucun article à analyser.", "Die gewählte Sammlung enthält keine Publikationen zur Analyse.",
      "В выбранной коллекции нет статей для анализа.",
    ],
    "Reading collection papers {current}/{total}…": [
      "正在讀取資料夾內的文獻 {current}/{total}…", "コレクション内の論文を読み込み中 {current}/{total}…", "컬렉션 논문 읽는 중 {current}/{total}…",
      "Lecture des articles de la collection {current}/{total}…", "Publikationen der Sammlung werden gelesen {current}/{total}…",
      "Чтение статей коллекции {current}/{total}…",
    ],
    "{papers} papers · {abstracts} with abstracts": [
      "{papers} 篇 · {abstracts} 篇有摘要", "{papers} 件 · 抄録あり {abstracts} 件", "논문 {papers}편 · 초록 있음 {abstracts}편",
      "{papers} articles · {abstracts} avec résumé", "{papers} Publikationen · {abstracts} mit Abstract",
      "Статей: {papers} · с аннотацией: {abstracts}",
    ],
    " · {count} using PDF excerpts": [
      " · {count} 篇使用 PDF 摘錄", " · PDF の抜粋を使用 {count} 件", " · PDF 발췌 사용 {count}편",
      " · extraits PDF pour {count}", " · PDF-Auszüge für {count}", " · с фрагментами PDF: {count}",
    ],
    " · {count} relevant records included": [
      " · 提供 {count} 篇相關文獻", " · 関連する文献 {count} 件を使用", " · 관련 문헌 {count}건 포함",
      " · {count} notices pertinentes", " · {count} relevante Einträge", " · включено релевантных записей: {count}",
    ],
    "Extracting collection evidence {current}/{total}…": [
      "正在擷取資料夾證據 {current}/{total}…", "コレクションから根拠を抽出中 {current}/{total}…", "컬렉션 근거 추출 중 {current}/{total}…",
      "Extraction des éléments probants {current}/{total}…", "Belege der Sammlung werden extrahiert {current}/{total}…",
      "Извлечение данных коллекции {current}/{total}…",
    ],
    "Combining collection evidence {current}/{total}…": [
      "正在彙整資料夾證據 {current}/{total}…", "コレクションの根拠を統合中 {current}/{total}…", "컬렉션 근거 통합 중 {current}/{total}…",
      "Regroupement des éléments probants {current}/{total}…", "Belege der Sammlung werden zusammengeführt {current}/{total}…",
      "Объединение данных коллекции {current}/{total}…",
    ],
    " · analyzed in batches": [" · 分批分析", " · 分割して分析", " · 분할 분석", " · analyse par lots", " · in Gruppen analysiert", " · анализ по группам"],
    "Answering using {sources}…": [
      "正在根據{sources}回答…", "{sources}に基づいて回答中…", "{sources}에 근거하여 답변 중…",
      "Réponse en cours. Sources : {sources}…", "Antwort wird erstellt. Quellen: {sources}…", "Подготовка ответа. Источники: {sources}…",
    ],
    "Answering…": ["正在回答…", "回答中…", "답변 중…", "Réponse en cours…", "Antwort wird erstellt…", "Подготовка ответа…"],
    "Enter a complete API URL, such as https://api.deepseek.com.": [
      "請填寫完整的 API 位址，例如 https://api.deepseek.com。", "https://api.deepseek.com のような完全な API URL を入力してください。",
      "https://api.deepseek.com과 같이 전체 API URL을 입력하세요.", "Saisissez une URL d’API complète, par exemple https://api.deepseek.com.",
      "Geben Sie eine vollständige API-URL ein, etwa https://api.deepseek.com.", "Введите полный URL API, например https://api.deepseek.com.",
    ],
    "Use an HTTP(S) API URL and enter the key in the separate field.": [
      "請使用 HTTP(S) API 位址，並在獨立欄位填寫金鑰。", "HTTP(S) の API URL を使用し、キーは別の欄に入力してください。",
      "HTTP(S) API URL을 사용하고 별도 필드에 키를 입력하세요.", "Utilisez une URL HTTP(S) et saisissez la clé dans le champ prévu.",
      "Verwenden Sie eine HTTP(S)-URL und geben Sie den Schlüssel im separaten Feld ein.",
      "Используйте URL HTTP(S) и введите ключ в отдельном поле.",
    ],
    "Enter a model ID.": [
      "請填寫模型 ID。", "モデル ID を入力してください。", "모델 ID를 입력하세요.",
      "Saisissez l’identifiant du modèle.", "Geben Sie eine Modell-ID ein.", "Введите идентификатор модели.",
    ],
    "Enter the API key for this provider.": [
      "請填寫此服務的 API 金鑰。", "このプロバイダーの API キーを入力してください。", "이 제공업체의 API 키를 입력하세요.",
      "Saisissez la clé API de ce fournisseur.", "Geben Sie den API-Schlüssel des Anbieters ein.", "Введите ключ API этого поставщика.",
    ],
    "The model returned an error.": [
      "模型傳回錯誤。", "モデルからエラーが返されました。", "모델이 오류를 반환했습니다.",
      "Le modèle a renvoyé une erreur.", "Das Modell hat einen Fehler zurückgegeben.", "Модель вернула ошибку.",
    ],
    "Could not connect to {host}. Check the API URL, network, and Zotero proxy settings.": [
      "無法連線至 {host}。請檢查 API 位址、網路和 Zotero 代理伺服器設定。",
      "{host} に接続できませんでした。API URL、ネットワーク、Zotero のプロキシ設定を確認してください。",
      "{host}에 연결할 수 없습니다. API URL, 네트워크 및 Zotero 프록시 설정을 확인하세요.",
      "Impossible de joindre {host}. Vérifiez l’URL de l’API, le réseau et le proxy de Zotero.",
      "Keine Verbindung zu {host}. Prüfen Sie die API-URL, das Netzwerk und die Zotero-Proxy-Einstellungen.",
      "Не удалось подключиться к {host}. Проверьте URL API, сеть и настройки прокси Zotero.",
    ],
    "Check the model ID and API parameters.": [
      "請檢查模型 ID 和 API 參數。", "モデル ID と API パラメータを確認してください。", "모델 ID와 API 매개변수를 확인하세요.",
      "Vérifiez l’identifiant du modèle et les paramètres de l’API.", "Prüfen Sie die Modell-ID und die API-Parameter.", "Проверьте идентификатор модели и параметры API.",
    ],
    "Check the API key and provider.": [
      "請檢查 API 金鑰及服務。", "API キーとプロバイダーを確認してください。", "API 키와 제공업체를 확인하세요.",
      "Vérifiez la clé API et le fournisseur.", "Prüfen Sie den API-Schlüssel und den Anbieter.", "Проверьте ключ API и поставщика.",
    ],
    "Check the API account balance.": [
      "請檢查 API 帳戶餘額。", "API アカウントの残高を確認してください。", "API 계정 잔액을 확인하세요.",
      "Vérifiez le solde du compte API.", "Prüfen Sie das Guthaben des API-Kontos.", "Проверьте баланс учётной записи API.",
    ],
    "Check API key permissions and model access.": [
      "請檢查金鑰權限及模型存取。", "API キーの権限とモデルへのアクセスを確認してください。", "API 키 권한과 모델 액세스를 확인하세요.",
      "Vérifiez les droits de la clé API et l’accès au modèle.", "Prüfen Sie die Rechte des API-Schlüssels und den Modellzugriff.",
      "Проверьте разрешения ключа API и доступ к модели.",
    ],
    "Check the API URL and model ID.": [
      "請核對 API 位址和模型 ID。", "API URL とモデル ID を確認してください。", "API URL과 모델 ID를 확인하세요.",
      "Vérifiez l’URL de l’API et l’identifiant du modèle.", "Prüfen Sie die API-URL und die Modell-ID.", "Проверьте URL API и идентификатор модели.",
    ],
    "The service is rate-limiting requests or the account reached its quota.": [
      "服務限制請求頻率，或帳戶已達配額。", "リクエスト頻度が制限されたか、アカウントの割り当て上限に達しました。",
      "서비스의 요청 한도 또는 계정 할당량에 도달했습니다.", "Le service limite les requêtes ou le quota du compte est atteint.",
      "Der Dienst begrenzt die Anfragen oder das Kontingent ist aufgebraucht.", "Сервис ограничил частоту запросов или исчерпана квота аккаунта.",
    ],
    "Model request failed (HTTP {status})": [
      "模型請求失敗（HTTP {status}）", "モデルへのリクエストに失敗しました（HTTP {status}）", "모델 요청 실패 (HTTP {status})",
      "Échec de la requête au modèle (HTTP {status})", "Modellanfrage fehlgeschlagen (HTTP {status})", "Ошибка запроса к модели (HTTP {status})",
    ],
    "The endpoint did not return JSON. Check the API URL.": [
      "端點未傳回 JSON。請檢查 API 位址。", "エンドポイントから JSON が返されませんでした。API URL を確認してください。",
      "엔드포인트가 JSON을 반환하지 않았습니다. API URL을 확인하세요.", "Le serveur n’a pas renvoyé de JSON. Vérifiez l’URL de l’API.",
      "Der Endpunkt hat kein JSON zurückgegeben. Prüfen Sie die API-URL.", "Сервер не вернул JSON. Проверьте URL API.",
    ],
    "The model reached its output limit. Increase the response token limit.": [
      "模型已達輸出上限。請提高回覆 Token 上限。", "モデルが出力上限に達しました。回答トークンの上限を引き上げてください。",
      "모델이 출력 한도에 도달했습니다. 응답 토큰 한도를 높이세요.", "Le modèle a atteint sa limite de sortie. Augmentez la limite de jetons de la réponse.",
      "Das Modell hat das Ausgabelimit erreicht. Erhöhen Sie das Tokenlimit für die Antwort.",
      "Модель достигла предела вывода. Увеличьте лимит токенов ответа.",
    ],
    "The model returned no text. Check the model ID and API URL.": [
      "模型未傳回文字。請檢查模型 ID 和 API 位址。", "モデルからテキストが返されませんでした。モデル ID と API URL を確認してください。",
      "모델이 텍스트를 반환하지 않았습니다. 모델 ID와 API URL을 확인하세요.",
      "Le modèle n’a renvoyé aucun texte. Vérifiez l’identifiant du modèle et l’URL de l’API.",
      "Das Modell hat keinen Text zurückgegeben. Prüfen Sie die Modell-ID und die API-URL.",
      "Модель не вернула текст. Проверьте идентификатор модели и URL API.",
    ],
    "[Output limit reached]": [
      "[已達輸出上限]", "[出力上限に達しました]", "[출력 한도에 도달함]",
      "[Limite de sortie atteinte]", "[Ausgabelimit erreicht]", "[Достигнут предел вывода]",
    ],
    "Full PDF translation requires an API URL without a query string.": [
      "整份 PDF 翻譯需要不含查詢參數的 API 位址。", "PDF 全体の翻訳には、クエリ文字列を含まない API URL が必要です。",
      "전체 PDF 번역에는 쿼리 문자열이 없는 API URL이 필요합니다.",
      "La traduction de PDF entiers nécessite une URL d’API sans paramètres de requête.",
      "Für die Übersetzung ganzer PDFs muss die API-URL ohne Abfrageparameter angegeben werden.",
      "Для перевода PDF целиком нужен URL API без строки запроса.",
    ],
    "BabelDOC requires a workspace-scoped Claude API key or a compatible gateway.": [
      "BabelDOC 需要工作區範圍的 Claude API 金鑰或相容的閘道。",
      "BabelDOC には、ワークスペース用の Claude API キーか、互換ゲートウェイが必要です.",
      "BabelDOC에는 작업 공간용 Claude API 키 또는 호환 게이트웨이가 필요합니다.",
      "BabelDOC nécessite une clé API Claude limitée à un espace de travail ou une passerelle compatible.",
      "BabelDOC benötigt einen Claude-API-Schlüssel für einen Arbeitsbereich oder ein kompatibles Gateway.",
      "BabelDOC требует ключа API Claude для рабочей области или совместимого шлюза.",
    ],
    "Choose the local BabelDOC executable in Settings.": [
      "請在設定中選擇本機 BabelDOC 執行檔。", "設定でローカルの BabelDOC 実行ファイルを選択してください。",
      "설정에서 로컬 BabelDOC 실행 파일을 선택하세요.", "Sélectionnez l’exécutable BabelDOC dans les paramètres.",
      "Wählen Sie die lokale BabelDOC-Programmdatei in den Einstellungen.", "Выберите локальный исполняемый файл BabelDOC в настройках.",
    ],
    "The source PDF is not downloaded.": [
      "尚未下載原文 PDF。", "元の PDF がダウンロードされていません。", "원본 PDF가 다운로드되지 않았습니다.",
      "Le PDF source n’a pas été téléchargé.", "Das Quell-PDF wurde noch nicht heruntergeladen.", "Исходный PDF не загружен.",
    ],
    "You do not have permission to add files to this library.": [
      "您沒有權限在這個文獻庫新增檔案。", "このライブラリにファイルを追加する権限がありません。",
      "이 라이브러리에 파일을 추가할 권한이 없습니다.", "Vous n’avez pas l’autorisation d’ajouter des fichiers à cette bibliothèque.",
      "Sie dürfen dieser Bibliothek keine Dateien hinzufügen.", "У вас нет прав на добавление файлов в эту библиотеку.",
    ],
    "bilingual": ["雙語", "対訳", "이중 언어", "bilingue", "zweisprachiges", "двуязычный"],
    "monolingual": ["單語", "翻訳のみの", "단일 언어", "monolingue", "einsprachiges", "одноязычный"],
    "This translation is already in progress.": [
      "此翻譯已在進行中。", "この翻訳はすでに進行中です。", "이 번역은 이미 진행 중입니다.",
      "Cette traduction est déjà en cours.", "Diese Übersetzung läuft bereits.", "Этот перевод уже выполняется.",
    ],
    "BabelDOC is generating a {kind} PDF…": [
      "BabelDOC 正在產生{kind} PDF…", "BabelDOC で {kind} PDF を作成中…", "BabelDOC에서 {kind} PDF를 생성하는 중…",
      "BabelDOC génère un PDF {kind}…", "BabelDOC erstellt ein {kind} PDF…", "BabelDOC создаёт {kind} PDF…",
    ],
    "Could not launch BabelDOC. Check the executable path in Settings.": [
      "無法啟動 BabelDOC。請在設定中檢查執行檔路徑。", "BabelDOC を起動できませんでした。設定で実行ファイルのパスを確認してください。",
      "BabelDOC를 실행할 수 없습니다. 설정에서 실행 파일 경로를 확인하세요.",
      "Impossible de lancer BabelDOC. Vérifiez le chemin de l’exécutable dans les paramètres.",
      "BabelDOC konnte nicht gestartet werden. Prüfen Sie den Programmpfad in den Einstellungen.",
      "Не удалось запустить BabelDOC. Проверьте путь к исполняемому файлу в настройках.",
    ],
    "BabelDOC did not produce a PDF.": [
      "BabelDOC 未產生 PDF。", "BabelDOC で PDF が生成されませんでした。", "BabelDOC가 PDF를 생성하지 못했습니다.",
      "BabelDOC n’a produit aucun PDF.", "BabelDOC hat kein PDF erstellt.", "BabelDOC не создал PDF.",
    ],
    "Adding the Zotero attachment…": [
      "正在新增 Zotero 附件…", "Zotero の添付ファイルを追加中…", "Zotero 첨부 파일 추가 중…",
      "Ajout de la pièce jointe à Zotero…", "Zotero-Anhang wird hinzugefügt…", "Добавление вложения Zotero…",
    ],
  };

  function language(config) {
    const index = additionalLocales.indexOf(config.uiLanguage);
    return (zh, en, values = {}) => {
      const message = config.uiLanguage === "zh-CN" ? zh : messages[en]?.[index] ?? en;
      return message.replace(/\{(\w+)\}/g, (token, key) => values[key] ?? token);
    };
  }

  Object.assign(PaperDesk, { language, interfaceLanguages, translationLanguages });
})();
