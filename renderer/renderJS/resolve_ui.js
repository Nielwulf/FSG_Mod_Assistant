/*  _______           __ _______               __         __   
   |   |   |.-----.--|  |   _   |.-----.-----.|__|.-----.|  |_ 
   |       ||  _  |  _  |       ||__ --|__ --||  ||__ --||   _|
   |__|_|__||_____|_____|___|___||_____|_____||__||_____||____|
   (c) 2022-present FSG Modding.  MIT License. */

// Version window UI

/* global l10n, fsgUtil, bootstrap */


/*  __ ____   ______        
   |  |_   | |      |.-----.
   |  |_|  |_|  --  ||     |
   |__|______|______||__|__| */

let badVersionString = false
let cacheShortName   = null
let cacheCollection  = null

function processL10N()          { clientGetL10NEntries() }
function clientGetL10NEntries() {
	const l10nSendItems = new Set()

	fsgUtil.query('l10n').forEach((thisL10nItem) => {
		l10nSendItems.add(fsgUtil.getAttribNullError(thisL10nItem, 'name'))
	})

	l10n.getText_send(l10nSendItems)
}

window.l10n.receive('fromMain_getText_return', (data) => {
	fsgUtil.query(`l10n[name="${data[0]}"]`).forEach((item) => { item.innerHTML = data[1] })
})
window.l10n.receive('fromMain_getText_return_title', (data) => {
	fsgUtil.query(`l10n[name="${data[0]}"]`).forEach((item) => {
		item.closest('span').title = data[1]
		new bootstrap.Tooltip(item.closest('span'))
	})
})
window.l10n.receive('fromMain_l10n_refresh', () => { processL10N() })


window.mods.receive('fromMain_modSet', (modSet, shortName) => {
	let version = [0, '0.0.0.0', null]
	const modHTML = []

	fsgUtil.byId('modName').innerHTML = shortName
	cacheShortName = shortName

	modSet.forEach((mod) => {
		version = compareVersion(version, mod[1], mod[0])
	})

	if ( badVersionString ) {
		fsgUtil.byId('newVersion').innerHTML = 'ERROR - NON-NUMERIC VERSION FOUND'
		fsgUtil.byId('copyButton').classList.add('disabled')
	} else {
		fsgUtil.byId('newVersion').innerHTML = version[1]
		fsgUtil.byId('copyButton').classList.remove('disabled')
		cacheCollection = version[2]
	}

	modSet.forEach((mod) => {
		modHTML.push(makeLine(mod, version))
	})

	fsgUtil.byId('modSet').innerHTML = modHTML.join('')
	processL10N()
})

function compareVersion(versionArray, thisVersion, collection) {
	const verParts = thisVersion.split('.').reverse()
	let thisVersionInt = 0

	for ( let i = 0; i < verParts.length; i++ ) {
		thisVersionInt += verParts[i] * Math.pow(10, i)
		if ( isNaN(thisVersionInt) ) { badVersionString = true }
	}

	if ( thisVersionInt > versionArray[0] ) {
		return [thisVersionInt, thisVersion, collection]
		
	}

	return versionArray
}


function makeLine(mod, version) {
	console.log(mod)
	const thisHTML = []

	if ( mod[1] === version[1] ) { //same
		thisHTML.push('<li class="list-group-item d-flex justify-content-between align-items-start list-group-item-dark">')
		thisHTML.push('<div class="ms-2 me-auto">')
		thisHTML.push(`<div class="fw-bold">${mod[2].fileDetail.shortName}</div>`)
		thisHTML.push(`<div class="small">${mod[2].l10n.title}</div>`)
		thisHTML.push(`<div class="text-black small ps-3"><l10n name="destination"></l10n> ${mod[3]} :: <l10n name="version_same"></l10n></div>`)
		thisHTML.push('</div>')
		thisHTML.push('</li>')
	} else {
		thisHTML.push('<li class="list-group-item d-flex justify-content-between align-items-start list-group-item-danger">')
		thisHTML.push('<div class="ms-2 me-auto">')
		thisHTML.push(`<div class="fw-bold">${mod[2].fileDetail.shortName} <span class="small">${mod[1]}</span></div>`)
		thisHTML.push(`<div class="small">${mod[2].l10n.title}</div>`)
		thisHTML.push(`<div class="text-black small ps-3"><l10n name="destination"></l10n> ${mod[3]}</div>`)
		thisHTML.push('</div>')
		thisHTML.push(`<input class="form-check-input form-check me-1" type="checkbox" name="modToCopy[]" value="${mod[0]}">`)
		thisHTML.push('</li>')
	}

	return thisHTML.join('')
}

function clientDoCopy() {
	const checked = document.querySelectorAll(':checked')
	const fileMap = []

	checked.forEach((thisCheck) => {
		fileMap.push([thisCheck.value, cacheCollection, `${cacheShortName}.zip`])
	})

	window.mods.realCopyFile(fileMap)
}
