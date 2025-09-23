<script setup lang="ts">
import imgIcon1 from '~/assets/images/advantage/icon-1.png'
import imgIcon2 from '~/assets/images/advantage/icon-2.png'
import imgIcon3 from '~/assets/images/advantage/icon-3.png'
import imgIcon4 from '~/assets/images/advantage/icon-4.png'

const topArr = [
  {
    title: '顶尖人才矩阵',
    content:
      '核心成员来自Google Brain、贝尔实验室、清华大学、北京大学、卡耐基梅隆大学等全球顶尖机构，且主导过千万级参数规模的产业级大模型研发项目； 团队累计发表NeurIPS/ACL等顶会论文十余篇，兼具学术前沿洞察与工业级实战经验',
    tags: ['顶尖机构', '顶会论文', '产业级大模型'],
  },
  {
    title: 'NLP工程化创新体系',
    content:
      '自主研发轻量化训练框架，实现模型参数量压缩75%的同时保持98%的原模型精度； 动态蒸馏技术使推理速度提升4.2倍，内存占用降低60%； 支持百亿级token的高效增量训练，适应快速迭代的垂直场景需求',
    tags: ['轻量化框架', '动态蒸馏', '增量训练'],
  },
]
const arr = [
  {
    style: { background: '#F0FAFF' },
    icon: imgIcon1,
    title: '心理大模型技术突破',
    subtitle: 'Seein心理多模态大模型创新性融合',
    contentList: [
      {
        title: '认知推理层',
        content:
          '构建心理知识图谱（含20万节点），集成CBT、DBT等六大心理咨询流派方法论',
      },
      {
        title: '多模态感知层',
        content: '整合微表情识别、语音情感谱分析、生理信号解析模块',
      },
      {
        title: '动态交互引擎',
        content: '支持共情响应生成与危机干预决策树',
      },
    ],
  },
  {
    style: { background: '#FFF5F5' },
    icon: imgIcon2,
    title: '权威验证体系',
    subtitle: '通过三层验证架构',
    contentList: [
      {
        title: '通用智能基准',
        content: '在SuperCLUE评测中成绩优异',
      },
      {
        title: '专业心理评估',
        content:
          '与北京大学心理与认知学院联合构建的评测体系，在SCL-90症状识别准确率达91.7%',
      },
      {
        title: '临床验证',
        content: '在三甲医院心理科实现与专业医师诊断结果87.3%的一致性',
      },
    ],
  },
  {
    style: { background: '#FFF9F7' },
    icon: imgIcon3,
    title: '产业落地版图',
    subtitle: '已形成覆盖医疗、教育等8大行业的解决方案矩阵',
    contentList: [
      {
        title: '教育领域',
        content: '部署于多所高校的心理预警平台，识别准确率提升40%',
      },
      {
        title: '智能硬件',
        content: '完成ARM架构边缘端适配，推理延迟＜500ms',
      },
    ],
  },
  {
    style: { background: '#F4F6FF' },
    icon: imgIcon4,
    title: '工程化能力图谱',
    subtitle: '构建从理论到落地的完整技术栈',
    contentList: [
      {
        title: '数据治理',
        content: '心理健康领域最大中文语料库（5000万+对话样本）',
      },
      {
        title: '训练优化',
        content: '自研分布式训练框架支持千卡集群效率达92%',
      },
      {
        title: '部署架构',
        content: '提供从千亿参数云端部署到10亿参数端侧部署的全套方案',
      },
    ],
  },
]
</script>

<template>
  <div md:flex="~ items-center justify-center" pb="60px">
    <div
      class="seein-advantage px-[16px] md:w-[1280px] md:px-0"
      flex="~ col justify-center"
      md:min-h="156vh"
    >
      <div flex="~ col" md:flex="row justify-between" w-full>
        <div class="seein-advantage__title" text="32px" md:text="60px">
          <UiElementVisible content="我们的优势" />
          <div
            flex="~ justify-center"
            gap="8px"
            text="16px"
            font="300"
            md:flex="col"
            md:gap="0"
            md:text="32px left"
          >
            <UiElementVisible content="OUR" />
            <UiElementVisible content="ADVANTAGES" />
          </div>
        </div>
        <div class="seein-advantage__content">
          <div
            v-aos="{ aos: 'fade-up', once: true, delay: 100 }"
            class="seein-advantage__content--top w-full flex-col"
          >
            <div
              v-for="(item, index) in topArr"
              :key="index"
              :class="{
                'md:ml-[0]': index > 0,
              }"
              class="seein-advantage__content--top-item md:w-[628px]"
            >
              <div class="seein-advantage__content--top-item-title">
                <UiElementVisible :content="item.title" />
              </div>
              <div class="seein-advantage__content--top-item-content">
                <UiElementVisible :content="item.content" />
              </div>
              <div class="seein-advantage__content--top-item-tags">
                <div
                  v-for="(tag, tagIndex) in item.tags"
                  :key="tagIndex"
                  class="seein-advantage__content--top-item-tags-item"
                >
                  <UiElementVisible :content="tag" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="seein-advantage__content mt-[20px] w-full">
        <div
          v-for="(item, index) in arr"
          :key="index"
          v-aos="{ aos: 'fade-up', once: true, delay: (index + 1) * 100 }"
          class="seein-advantage__content--item"
          md:w="305px"
          w="full"
        >
          <div
            class="seein-advantage__content--item-title"
            flex="items-center"
            md:flex="col items-start"
          >
            <UiElementVisible>
              <img
                class="seein-advantage__content--item-title-icon"
                md:mb="24px"
                :src="item.icon"
              />
            </UiElementVisible>
            <UiElementVisible :content="item.title" />
          </div>
          <div class="seein-advantage__content--item-subtitle">
            <UiElementVisible :content="item.subtitle" />
          </div>
          <div class="seein-advantage__content--item-content">
            <div
              v-for="(content, contentIndex) in item.contentList"
              :key="contentIndex"
              class="seein-advantage__content--item-content-item"
            >
              <UiElementVisible>
                <div class="seein-advantage__content--item-content-item-title">
                  <UiSvgIcon :size="12" name="vector" class="mr-[8px]" />
                  {{ content.title }}
                </div>
              </UiElementVisible>
              <div class="seein-advantage__content--item-content-item-content">
                <UiElementVisible :content="content.content" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-advantage {
  display: flex;
  align-items: center;
  &__title {
    font-weight: 500;
    text-align: center;
    margin-bottom: 36px;
  }
  &__content {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    &--top {
      background: #fefffd;
      border: 1px solid #c8d9cc;
      border-radius: 20px;
      display: flex;
      position: relative;
      &-item {
        display: flex;
        flex-direction: column;
        padding: 34px 24px;
        &-title {
          font-size: 28px;
          font-weight: 600;
          color: #062721;
          margin-bottom: 16px;
        }
        &-content {
          flex: 1;
          font-size: 14px;
          color: #062721;
          line-height: 24px;
          margin-bottom: 10px;
        }
        &-tags {
          display: flex;
          &-item {
            background-color: #e8f0e5;
            font-size: 12px;
            color: #062721;
            line-height: 14px;
            border-radius: 6px;
            border: 1px solid #cadfcd;
            padding: 4px 10px;
            & + & {
              margin-left: 8px;
            }
          }
        }
      }
    }
    &--item {
      border: 1px solid #c8d9cc;
      background: #fefffd;
      border-radius: 20px;
      padding: 24px;
      &-title {
        display: flex;
        font-weight: 600;
        font-size: 26px;
        color: #062721;
        margin-bottom: 28px;
        &-icon {
          width: 60px;
          height: 60px;
          margin-right: 24px;
        }
      }
      &-subtitle {
        font-size: 16px;
        color: #062721;
        line-height: 21px;
        margin-bottom: 16px;
      }
      &-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
        &-item {
          &-title {
            font-weight: 600;
            font-size: 16px;
            color: #062721;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
          }
          &-content {
            font-size: 14px;
            color: #5e5e5e;
            line-height: 24px;
          }
        }
      }
    }
  }
}
</style>
