
export function formatTerminalOutput(str) {
  str = str.replace(/\n/g, '<br>');

  str = str.replace(/\033\[38;5;9;1m/g, '<span class="red">');
  str = str.replace(/\033\[38;5;5;1m/g, '<span class="purple">');
  str = str.replace(/\033\[38;5;12m/g, '<span class="blue">');
  
  str = str.replace(/\033\[1m/g, '<b>').replace(/\033\[22m/g, '</b>');
  str = str.replace(/\033\[3m/g, '<i>').replace(/\033\[23m/g, '</i>');
  
  str = str.replace(/\033\[m/g, '</span>');
  str = str.replace(/\033\[0m/g, '</span>');
  str = str.replace(/\033\[0;1m/g, '</span>');
  str = str.replace(/\033\[39m/g, '</span>');
  return str.replace(/\033\[[0-9;]*m/g, '');
};
