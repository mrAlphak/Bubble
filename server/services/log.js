const chalk = require('chalk')

const Log=(message, type = 'info')=>{
    let color = ''
    let prefix = ''

    switch (type) {
        case 'info':
            color = 'bgBlue'
            prefix = 'Info'
            break
        case 'warning':
            color = 'bgYellow'
            prefix = 'Warning'
            break
        case 'error':
            color = 'bgRed'
            prefix = 'Error'
            break
        default:
            color = 'bgBlue'
            prefix = 'Info'
            break
    }
    const prefixWithBgColor = chalk[color].black(` ${prefix} `)
    return console.log(`${prefixWithBgColor} ${message}`)
}

module.exports = Log