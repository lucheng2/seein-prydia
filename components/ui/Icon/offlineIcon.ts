import addCommentOutlineRounded from '@iconify-icons/material-symbols/add-comment-outline-rounded'
import arrowBackIosNewRounded from '@iconify-icons/material-symbols/arrow-back-ios-new-rounded'
import arrowCircleUpRounded from '@iconify-icons/material-symbols/arrow-circle-up-rounded'
import logoutRounded from '@iconify-icons/material-symbols/logout-rounded'
import thumbDownOutlineRounded from '@iconify-icons/material-symbols/thumb-down-outline-rounded'
import thumbDownRounded from '@iconify-icons/material-symbols/thumb-down-rounded'
import thumbUpOutlineRounded from '@iconify-icons/material-symbols/thumb-up-outline-rounded'
import thumbUpRounded from '@iconify-icons/material-symbols/thumb-up-rounded'
import layoutRightbarCloseLine from '@iconify-icons/mingcute/layout-rightbar-close-line'
import layoutRightbarOpenLine from '@iconify-icons/mingcute/layout-rightbar-open-line'
import refresh3Line from '@iconify-icons/mingcute/refresh-3-line'
import settings1Line from '@iconify-icons/mingcute/settings-1-line'
import telegramAlt from '@iconify-icons/uil/telegram-alt'
import { addIcon } from '@iconify/vue/dist/offline'
/**
 * 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
 */
addIcon('layout-rightbar-close-line', layoutRightbarCloseLine)
addIcon('layout-rightbar-open-line', layoutRightbarOpenLine)
addIcon('settings-1-line', settings1Line)
addIcon('logout-rounded', logoutRounded)
addIcon('telegram-alt', telegramAlt)
addIcon('add-comment-outline-rounded', addCommentOutlineRounded)
addIcon('arrow-circle-up-rounded', arrowCircleUpRounded)
addIcon('refresh-3-line', refresh3Line)
addIcon('thumb-up-outline-rounded', thumbUpOutlineRounded)
addIcon('thumb-up-rounded', thumbUpRounded)
addIcon('thumb-down-outline-rounded', thumbDownOutlineRounded)
addIcon('thumb-down-rounded', thumbDownRounded)
addIcon('arrow-back-ios-new-rounded', arrowBackIosNewRounded)
