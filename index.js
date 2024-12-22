const ul_clock_list = document.getElementById("clock-list")
const clock_list = {}
const button_backup = document.getElementById("button-backup")
const backup_painel = document.getElementById("backup-painel")
const backup_input = document.getElementById("backup-input")
const backup_buttom_export = document.getElementById("button-export")
const backup_buttom_import = document.getElementById("button-import")
let import_clicked = false
let button_backup_enable = false

function sync_clocks() {
  localStorage.setItem("clocks", JSON.stringify(clocks))
}

function t_format(time) {
  const hours = Math.floor(time / 3600); // Calcula as horas
  const minutes = Math.floor((time % 3600) / 60); // Calcula os minutos
  const seconds = time % 60; // Calcula os segundos restantes

  // Formata os valores para ter dois dígitos
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  // Retorna a string no formato "hh:mm:ss"
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function t_parse(timeString) {
  // Verifica se a string está no formato correto usando uma expressão regular
  const timeFormat = /^(\d{2}):(\d{2}):(\d{2})$/;
  const match = timeString.match(timeFormat);

  if (!match) {
    return undefined; // Retorna undefined se o formato for inválido
  }

  // Extrai horas, minutos e segundos dos grupos capturados
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);

  // Valida que os valores extraídos estão dentro dos limites aceitáveis
  if (hours < 0 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
    return undefined; // Retorna undefined se os valores forem inválidos
  }

  // Calcula o total de segundos
  return hours * 3600 + minutes * 60 + seconds;
}

function nowDate() {
  const data = new Date();
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
  const ano = String(data.getFullYear()).slice(-2); // Apenas os últimos 2 dígitos do ano
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}


function addClock({name, time=0, start_time=undefined, logs=""}) {
  const sync_this_clock = () => {
    clocks[name] = {
      "name": name,
      "time": time,
      "start_time": start_time,
      "logs": logs,
      "lastStart": new Date()
    }
    sync_clocks()
  }

  const li = document.createElement("li")
  li.className = "shadow"

  let old_time = time

  const div_center_clock_title = document.createElement("div")
  const div_clock_title = document.createElement("div")
  div_center_clock_title.className = "center-div"
  div_clock_title.className = "clock-title"
  div_clock_title.innerText = name
  div_center_clock_title.append(div_clock_title)

  const div_clock_painel = document.createElement("div")
  div_clock_painel.className = "clock-painel"

  const div_center_clock_time = document.createElement("div")
  const input_clock_time = document.createElement("input")
  div_center_clock_time.append(input_clock_time)
  div_center_clock_time.className = "center-div"
  input_clock_time.className = "clock-time"
  input_clock_time.value = t_format(time)

  const div_log = document.createElement("div")
  div_log.className = "log-div"
  div_log.style.display = "none"
  div_log.innerText = logs

  const button_play = document.createElement("button")
  const button_logs = document.createElement("button")
  const button_trash = document.createElement("button")
  button_play.innerText = "▶"
  button_play.className = "clock-buttons"
  button_logs.innerText = "logs"
  button_logs.className = "clock-buttons"
  button_trash.innerText = "🗑️"
  button_trash.className = "clock-buttons"

  li.append(div_center_clock_title)
  div_clock_painel.append(div_center_clock_time)
  div_clock_painel.append(button_play)
  div_clock_painel.append(button_trash)
  div_clock_painel.append(button_logs)
  li.append(div_clock_painel)
  li.append(div_log)
  ul_clock_list.appendChild(li)

  const save_time_log = () => {
    const symbol = time - old_time >= 0 ? "+" : "-"
    logs = `\n[${nowDate()}] ${t_format(old_time)} -> ${t_format(time)} [${symbol}${t_format(Math.abs(time - old_time))}]` + logs
    old_time = time
    div_log.innerText = logs
  }

  if(start_time != undefined) {
    time += Math.floor((new Date() - new Date(start_time))/1000)
    start_time = undefined
    sync_this_clock()
    save_time_log()
    setTimeout(() => {
      input_clock_time.value = t_format(time)
    }, 200)
  } 

  button_logs.addEventListener("click", () => {
    if (div_log.style.display == "none") {
      div_log.style.display = "block"
    } else {
      div_log.style.display = "none"
    }
  })

  button_play.addEventListener("click", () => {
    const running = button_play.innerText == "◼"
    if (running) {
      button_play.innerText = "▶"
      start_time = undefined
      sync_this_clock()
      save_time_log()
    } else {
      button_play.innerText = "◼"
      start_time = new Date()
    }
    sync_this_clock()
  })

  button_trash.addEventListener("click", () => {
    delete clocks[name]
    sync_clocks()
    li.remove()
  })

  input_clock_time.addEventListener("focus", () => {
    button_play.innerText = "▶"
  })
  
  input_clock_time.addEventListener("blur", () => {
    if(input_clock_time.value != t_format(time)) {
      _time = t_parse(input_clock_time.value)
      if(_time != undefined) {
        time = _time
      }
      input_clock_time.value = t_format(time)
      start_time = undefined
      sync_this_clock()
      save_time_log()
    }
  })

  setInterval(() => {
    if (button_play.innerText == "▶") {
      return
    }
    time += 1
    input_clock_time.value = t_format(time)
  }, 1000)
}
let clocks = null

if(localStorage.getItem("clocks") == null) {
  clocks = {}
  localStorage.setItem("clocks", JSON.stringify(clocks))
} else {
  clocks = JSON.parse(localStorage.getItem("clocks"))
}

function main() {
  const sortedClocks = Object.entries(clocks)
  .sort(([, a], [, b]) => new Date(b.lastStart) - new Date(a.lastStart)); // Ordena do mais recente ao mais antigo

  for (const [key, clock] of sortedClocks) {
    addClock(clock); // Substitua pela sua lógica
  }

  const input_clock_name = document.getElementById("input-clock-name")
  const button_add_clock = document.getElementById("button-add-clock")

  button_add_clock.addEventListener("click", () => {
    const clock_name = input_clock_name.value
    if(clocks[clock_name] == undefined) {
      clocks[clock_name] = {
        name: clock_name,
        time: 0,
        start_time: undefined,
        logs: "",
        lastStart: new Date()
      }
      sync_clocks()
      addClock(clocks[clock_name])
    }
  })
}

window.addEventListener("load", () => {
  main()
  registerSW()
})

async function registerSW() {
  if('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js")
    } catch(e) {
      console.log("SW registration failed")
    }
  }
}

button_backup.addEventListener("click", () => {
  if(button_backup_enable) {
    backup_painel.style.display = "none"
    button_backup_enable = false
  } else {
    backup_painel.style.display = "block"
    button_backup_enable = true
  }
})

backup_buttom_import.addEventListener("click", () => {
  navigator.clipboard.readText().then((clipboard_text) => {
    if(import_clicked) {
      localStorage.setItem("clocks", clipboard_text)
      location.reload()
    }
    backup_input.value = clipboard_text
    import_clicked = true
  })
})

backup_input.addEventListener("focus", () => {
  import_clicked = false
})

backup_buttom_export.addEventListener("click", () => {
  import_clicked = false
  // Get the text field
  var copyText = localStorage.getItem("clocks")

  backup_input.value = copyText

   // Copy the text inside the text field
  navigator.clipboard.writeText(copyText);
})
