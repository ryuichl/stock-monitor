;(async function () {
    try {
        const argv = require('yargs').argv
        const tdaclient = require('tda-api-client')
        const dayjs = require('dayjs')
        const technicalIndicators = require('technicalindicators')
        technicalIndicators.setConfig('precision', 10)
        const SMA = technicalIndicators.SMA
        const fs = require('fs-extra')

        const get_history = async (target) => {
            const config = {
                periodType: tdaclient.pricehistory.PERIOD_TYPE.YEAR,
                frequencyType: tdaclient.pricehistory.FREQUENCY_TYPE.MONTH.DAILY,
                frequency: tdaclient.pricehistory.FREQUENCY.DAILY.ONE,
                symbol: target,
                getExtendedHours: 'false'
            }
            const result = await tdaclient.pricehistory.getPriceHistory(config)
            const data = result.candles.map((row) => {
                row.date = dayjs(row.datetime).format()
                return row
            })
            return data
        }
        const get_sma = (input) => {
            const data = input.reduce(
                (obj, row) => {
                    obj.close.push(row.close)
                    obj.volume.push(row.volume)
                    obj.date.push(dayjs(row.datetime).format())
                    return obj
                },
                { close: [], date: [], volume: [] }
            )
            const sma5 = SMA.calculate({ period: 5, values: data.close })
            const sma5_volume = SMA.calculate({ period: 5, values: data.volume })
            const sma10 = SMA.calculate({ period: 10, values: data.close })
            const sma20 = SMA.calculate({ period: 20, values: data.close })
            const result = input.reduce((array, row, index) => {
                if (index + 1 >= 5) {
                    row.sma5 = sma5[index - (5 - 1)]
                    row.sma5_volume = sma5_volume[index - (5 - 1)]
                }
                if (index + 1 >= 10) {
                    row.sma10 = sma10[index - (10 - 1)]
                }
                if (index + 1 >= 20) {
                    row.sma20 = sma20[index - (20 - 1)]
                }
                array.push(row)
                return array
            }, [])
            return result
        }
        const find_point = (input) => {
            let i = 'sell'
            const result = input.reduce((array, row, index) => {
                const pre_row = input[index - 1]
                if (!row.sma5 || !row.sma10 || !row.sma20) {
                    return array
                }
                if (pre_row.sma5 < pre_row.sma10 && row.sma5 > row.sma10 && row.sma5 > row.sma20 && row.sma10 > row.sma20 && row.volume > pre_row.sma5_volume && i === 'sell') {
                    i = 'buy'
                    row.action = 'buy'
                    array.push(row)
                }
                if (row.sma5 < row.sma20 && i === 'buy') {
                    i = 'sell'
                    row.action = 'sell'
                    array.push(row)
                }
                return array
            }, [])
            return result
        }

        const target = 'AMZN'
        if (argv.job === 'init') {
            const data = await get_history(target)
            await fs.outputJSON(`./db/${target}.json`, data)
            console.log('done')
            return process.exit(0)
        } else if (argv.job === 'sort') {
            const init = await fs.readJSON(`./db/${target}.json`)
            const result = get_sma(init)
            await fs.outputJSON(`./db/${target}_sort.json`, result)
            console.log('done')
            return process.exit(0)
        } else if (argv.job === 'find') {
            const sort = await fs.readJSON(`./db/${target}_sort.json`)
            const find = find_point(sort)
            await fs.outputJSON(`./db/${target}_find.json`, find)
            console.log('done')
            return process.exit(0)
        } else if (argv.job === 'all') {
            const history = await get_history(target)
            const sma = get_sma(history)
            const point = find_point(sma)
            await fs.outputJSON(`./db/${target}_find.json`, point)
            console.log('done')
            return process.exit(0)
        }
    } catch (err) {
        console.log(err)
    }
    // return process.exit(0)
})()
