const dialog = require('electron').dialog
const Sequelize = require('sequelize')
const xlsx = require('node-xlsx')
const sqlite3 = require('sqlite3')
const sequelize = new Sequelize({
    dialect: 'sqlite'
})

// 定义协议schema
const schema = {
    nf: Sequelize.STRING,
    ssdm: Sequelize.STRING, // 省市代码
    ssmc: Sequelize.STRING, // 省市名称
    xm: Sequelize.STRING, // 姓名
    xbdm: Sequelize.STRING, // 性别代码
    xbmc: Sequelize.STRING, // 性别名称
    mzdm: Sequelize.STRING, // 民族代码
    mzmc: Sequelize.STRING, // 民族名称
    kslbdm: Sequelize.STRING, // 考生类别代码
    kslbmc: Sequelize.STRING, // 考生类别名称
    zxmc: Sequelize.STRING, // 中学名称
    pcdm: Sequelize.STRING, // 批次代码
    pcmc: Sequelize.STRING, // 批次名称
    kldm: Sequelize.STRING, // 科类代码
    klmc: Sequelize.STRING, // 科类名称
    tdcj: Sequelize.STRING, // 成绩
    zydm: Sequelize.STRING, // 专业代码
    zymc: Sequelize.STRING, // 专业名称
    yxdm: Sequelize.STRING, // 院系代码
    yxmc: Sequelize.STRING // 院系名称
  }
// 模型定义的所有字段和数据表格同步
const enrollment = sequelize.define('enrollment', schema)
enrollment.sync()
const loadData = () => {
    dialog.showOpenDialog({
        title: '选择数据xlsx文件',
        filters: ['xlsx'],
        properties: ['openFile']
    }, async (filePath) => {
        if (filePath) {
            // 删除数据库原有数据
            console.log('正在清扫原始数据')
            await enrollment.destroy({where:{}})
            new Promise((resolve, reject) => {
                let srcData = xlsx.parse(filePath[0])
                let count = 0
                for (let table of srcData) {
                    try{
                        let tableHeader = table.data[0]
                        for (let row of table.data) {
                            let newItem = {}
                            if (row[0] === tableHeader[0]) { continue } //略过表头
                            for (let col in row) {
                                if (schema[tableHeader[col]]) {
                                    newItem[tableHeader[col]] = row[col]
                                }
                            }
                            enrollment.create(newItem)
                            count++
                        }
                    } catch(e) {
                        console.log(e)
                    }
                }
                console.log(`本次加载共${count}条`)
            })
        }
    })
}

module.exports = { loadData }
