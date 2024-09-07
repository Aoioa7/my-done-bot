//ここで統一
//毎週月水金に、前日までにマージされた機能ごとに、NotionページのタイトルとURLをSlackのチャンネルに通知するbot
function myFunction() {
  const data = getNotionData("c5690bfc5c6f4122a91a1e01dcfaf45f");
  const messages = data.results;

  for (m of messages) {
    if (notDeployed(m.properties.マージ日時.date.start)) {continue};
    const message = {
      "text":m.properties.Name.title[0]?.plain_text+"\n"+m.url+"\n---",
    };
    sendSlackMessage(message);
  }
}

//今回は月水金のタイミングでその日を除いて新しくデプロイされた機能を通知
//場合分けが月曜だけなのは、トリガーですでに月水金に絞り込んでいるから
function notDeployed(date) {
  const theDay = new Date(date);
  const today = new Date;
  const youbi = today.getDay();

  console.log(date.substring(0,date.indexOf("T")),"\n"+theDay,"\n"+Utilities.formatDate(today,'JST','yyyy-MM-dd'),"\n"+today,"\n"+youbi);

  const day1 = new Date(date);
  const diff = (today-theDay)/86400000;
  console.log(diff)
  if (youbi == 1 && diff <= 1) {
    return true
  }
  else if (diff <= 1) {
    return true
  };

  return false;
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

//doneされたページを取得
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
