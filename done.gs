//この関数で統一して、トリガーで定期実行
//毎週月水金に、その日の午前までに新しく完了したタスクごとに、自分のNotionページのタイトルとURLをSlackのチャンネルに通知するbot
function myFunction() {
  const data = getNotionData("c5690bfc5c6f4122a91a1e01dcfaf45f");
  const messages = data.results;

  for (m of messages) {
    if (annouced(m.properties.完了日時.date.start)) {continue};
    const message = {
      "text":m.properties.Name.title[0]?.plain_text+"\n"+m.url+"\n---",
    };
    sendSlackMessage(message);
  }
}

//今回は月水金のタイミングでその日の午前までに新しく完了したタスクを通知
//場合分けが月曜だけなのは、トリガーですでに月水金(の12:00)に絞り込んでいるから
//コンソールに日時情報を出力(確認用)
function announced(date) {
  const theDay = new Date(date);
  const today = new Date;
  const youbi = today.getDay();

  console.log(date.substring(0,date.indexOf("T")),"\n"+theDay,"\n"+Utilities.formatDate(today,'JST','yyyy-MM-dd'),"\n"+today,"\n"+youbi);

  const day1 = new Date(date);
  const diff = (today-theDay)/86400000;
  console.log(diff);
  if (youbi == 1 && diff <= 3) {
    return false;
  }
  else if (diff <= 2) {
    return false;
  };

  return true;
}

//slackに通知(ページのタイトルとURL)
function sendSlackMessage(payload) {
  const url = PropertiesService.getScriptProperties().getProperty("WEBHOOK_URL");
  
  const options = {
      "method" : "post",
      "contentType" : "application/json",
      "payload" : JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, options);
}

//Notionからdoneされたページを取得
function getNotionData(id) {
  const url = "https://api.notion.com/v1/databases/"+id+"/query";
  const token = PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");
  
  const headers = {
		"Content-Type": "application/json",
		"Authorization": "Bearer "+token,
		"Notion-Version": "2022-06-28",
	};
  const payload = {
    "filter": {
      "and": [
        {
          "property": "done",
          "checkbox": {
            "equals": true
          }              
        }
      ]
    }
  };
	const options = {
		"method" : "post",
		"headers" : headers,
    "payload": JSON.stringify(payload),
	};

	const response = UrlFetchApp.fetch(url,options);
	data = JSON.parse(response);
	return data;
}
