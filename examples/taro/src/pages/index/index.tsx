import { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Button, Card, Input, Select, Drawer } from 'animal-island-ui/taro';
import type { CardPattern, SelectOption } from 'animal-island-ui/taro';
import catalog from '../../catalog.json';

declare const ANIMAL_FONT_BASE: string;
const islands: SelectOption[] = [
    { key: 'forest', label: '森间岛' },
    { key: 'sea', label: '海风岛' },
    { key: 'moon', label: '月光岛' },
    { key: 'sun', label: '向阳岛' },
    { key: 'cloud', label: '云朵岛' },
    { key: 'peach', label: '桃子岛' },
    { key: 'rain', label: '听雨岛' },
];
const ready = ['Button', 'Card', 'Input', 'Drawer', 'Select'];
export default function Index() {
    const [name, setName] = useState('小岛居民');
    const [island, setIsland] = useState('');
    const [friend, setFriend] = useState('');
    const [notice, setNotice] = useState('还没有保存，选好小岛后点下方按钮。');
    const [drawer, setDrawer] = useState(false);
    const [nested, setNested] = useState(false);
    const [input, setInput] = useState('可直接清除这段文字');
    const [count, setCount] = useState(0);
    const [event, setEvent] = useState('等待操作');
    const [options, setOptions] = useState(islands);
    const [testValue, setTestValue] = useState('sea');
    const [empty, setEmpty] = useState('');
    const [pattern, setPattern] = useState<CardPattern>('app-teal');
    const [font, setFont] = useState(
        process.env.TARO_ENV === 'h5' ? '正在加载原库字体…' : '未配置字体服务器：当前是系统回退字体'
    );
    useEffect(() => {
        if (process.env.TARO_ENV === 'h5') {
            Promise.all([
                document.fonts.load('700 16px Nunito', 'Animal Island'),
                document.fonts.load('500 16px "Noto Sans SC"', '动物岛'),
            ])
                .then(() => setFont('Nunito + Noto Sans SC · 原库字体已加载'))
                .catch(() => setFont('字体加载失败：当前是系统回退字体'));
        } else if (ANIMAL_FONT_BASE) {
            Promise.all([
                Taro.loadFontFace({
                    global: true,
                    family: 'Nunito',
                    source: `url("${ANIMAL_FONT_BASE}/nunito-latin-700-normal.woff2")`,
                    desc: { weight: '700' },
                }),
                Taro.loadFontFace({
                    global: true,
                    family: 'Noto Sans SC',
                    source: `url("${ANIMAL_FONT_BASE}/noto-sans-sc-chinese-simplified-500-normal.woff2")`,
                    desc: { weight: '500' },
                }),
            ])
                .then(() => setFont('原库字体已加载 · 请在真机复核'))
                .catch(() => setFont('字体加载失败：当前是系统回退字体'));
        }
    }, []);
    return (
        <View className="preview-page">
            <View className="hero">
                <View className="eyebrow">ANIMAL ISLAND UI / MOBILE</View>
                <View className="hero-title">
                    把小岛，
                    <View />
                    装进口袋。
                </View>
                <View className="hero-copy">
                    熟悉的奶油色、圆润的按钮。
                    <View />
                    这次，轻点、滑动，就能完成选择。
                </View>
                <View className="font-status">{font}</View>
            </View>
            <Card pattern="default">
                <View className="eyebrow">一起试试</View>
                <View className="card-title">你的登岛名片</View>
                <View className="stack">
                    <View>
                        <Text className="field-label">怎么称呼你</Text>
                        <Input
                            ariaLabel="居民昵称"
                            aria-label="居民昵称"
                            value={name}
                            onChange={setName}
                            placeholder="输入昵称"
                            allowClear
                        />
                    </View>
                    <View>
                        <Text className="field-label">想住在哪座岛</Text>
                        <Select
                            title="选择你的小岛"
                            aria-label="选择小岛"
                            options={islands}
                            value={island}
                            onChange={setIsland}
                            placeholder="轻点，滚动选一个"
                            allowClear
                        />
                    </View>
                    <View>
                        <Text className="field-label">邀请一位邻居</Text>
                        <Select
                            title="寻找邻居"
                            aria-label="选择邻居"
                            showSearch
                            options={[
                                { key: 'lulu', label: '露露 · 花店老板' },
                                { key: 'ami', label: '阿米 · 森林向导' },
                                { key: 'qiu', label: '小秋 · 面包师' },
                                { key: 'tao', label: '桃桃 · 园艺师' },
                            ]}
                            value={friend}
                            onChange={setFriend}
                            placeholder="轻点，搜索邻居"
                            allowClear
                        />
                    </View>
                    <Button
                        type="primary"
                        block
                        onClick={() =>
                            setNotice(
                                !name.trim()
                                    ? '先留下你的名字吧。'
                                    : !island
                                      ? '还没有选择小岛哦。'
                                      : `${name}，欢迎来到${islands.find((o) => o.key === island)?.label}。名片已保存在本次预览中。`
                            )
                        }
                    >
                        保存我的名片
                    </Button>
                </View>
                <View className="feedback" ariaRole="status">
                    {notice}
                </View>
            </Card>
            <View className="section">
                <View className="section-heading">
                    <Text className="section-title">01 / Button</Text>
                    <Text className="section-note">按压反馈 · 触摸热区</Text>
                </View>
                <View className="button-grid">
                    <Button block type="primary" onClick={() => setCount((v) => v + 1)}>
                        点我试试
                    </Button>
                    <Button block onClick={() => setCount((v) => v + 1)}>
                        默认按钮
                    </Button>
                    <Button block type="dashed">
                        虚线按钮
                    </Button>
                    <Button block type="text">
                        文字
                    </Button>
                    <Button block type="link">
                        链接
                    </Button>
                    <Button block type="primary" danger>
                        危险操作
                    </Button>
                    <Button block type="primary" ghost>
                        透明
                    </Button>
                    <Button block loading>
                        加载中
                    </Button>
                    <Button block disabled>
                        暂不可用
                    </Button>
                </View>
                <View className="size-row">
                    <Button size="small" type="primary">
                        Small
                    </Button>
                    <Button size="large" type="primary">
                        Large
                    </Button>
                </View>
                <View className="feedback">有效点击：{count} 次</View>
            </View>
            <View className="section">
                <View className="section-heading">
                    <Text className="section-title">02 / Card</Text>
                    <Text className="section-note">原版配色 · 原版点阵</Text>
                </View>
                <View className="stack">
                    <Card>
                        <View className="card-title">奶油色的午后</View>
                        <View className="card-copy">没有额外阴影，保留原版纸张般的颜色。</View>
                    </Card>
                    <Card
                        pattern={pattern}
                        hoverable
                        onClick={() => setPattern((p) => (p === 'app-teal' ? 'app-pink' : 'app-teal'))}
                    >
                        <View className="card-title">轻点，换一张小卡片</View>
                        <View className="card-copy">沿用原版青绿与粉色点阵，按下会有反馈。</View>
                    </Card>
                    <Card type="dashed">
                        <View className="card-copy">虚线卡片 · 可放补充说明</View>
                    </Card>
                </View>
            </View>
            <View className="section">
                <View className="section-heading">
                    <Text className="section-title">03 / Input</Text>
                    <Text className="section-note">常驻清除 · 键盘输入</Text>
                </View>
                <View className="stack">
                    <Input
                        ariaLabel="可清除输入"
                        aria-label="可清除输入"
                        value={input}
                        onChange={setInput}
                        allowClear
                    />
                    <Input ariaLabel="阴影输入" aria-label="阴影输入" shadow placeholder="显式开启 shadow 的输入框" />
                    <Input
                        ariaLabel="错误输入"
                        aria-label="错误输入"
                        status="error"
                        placeholder="错误状态仍保留状态阴影"
                    />
                    <Input ariaLabel="禁用输入" aria-label="禁用输入" disabled value="这是禁用状态" />
                </View>
            </View>
            <View className="section">
                <View className="section-heading">
                    <Text className="section-title">04 / Drawer</Text>
                    <Text className="section-note">安全区 · 长内容 · 层叠</Text>
                </View>
                <Button block onClick={() => setDrawer(true)}>
                    打开底部抽屉
                </Button>
            </View>
            <View className="section">
                <View className="section-heading">
                    <Text className="section-title">05 / Select</Text>
                    <Text className="section-note">边界状态也可以试</Text>
                </View>
                <Card>
                    <View className="stack">
                        <Select
                            title="选择测试小岛"
                            aria-label="测试选择"
                            options={options}
                            value={testValue}
                            onChange={(key) => {
                                setTestValue(key);
                                setEvent(`onChange: ${key || '(空)'}`);
                            }}
                            allowClear
                            onClear={() => setEvent("先 onChange('')，再 onClear")}
                        />
                        <View className="row">
                            <Button size="small" onClick={() => setOptions((o) => [...o].reverse())}>
                                反转选项
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    setOptions(islands);
                                    setTestValue('moon');
                                    setEvent('外部设为月光岛');
                                }}
                            >
                                外部设值
                            </Button>
                        </View>
                        <Select
                            title="暂无小岛"
                            aria-label="空选项测试"
                            options={[]}
                            value={empty}
                            onChange={setEmpty}
                            placeholder="空选项：确认按钮不可用"
                        />
                        <Select
                            aria-label="禁用选择"
                            options={islands}
                            value="forest"
                            onChange={() => setEvent('不应触发')}
                            disabled
                        />
                        <View className="feedback">
                            当前 key：{testValue || '(空)'}
                            <View />
                            {event}
                        </View>
                    </View>
                </Card>
            </View>
            <View className="divider" />
            <View className="section-heading">
                <Text className="section-title">改造进度</Text>
                <Text className="section-note">5 / 38 可迁移组件</Text>
            </View>
            <View className="catalog">
                {catalog.map((item) => (
                    <View
                        key={item}
                        className={`catalog-item ${ready.includes(item) ? 'ready' : item === 'Cursor' ? 'skipped' : ''}`}
                    >
                        {item}
                        {ready.includes(item) ? ' · 首批' : item === 'Cursor' ? ' · 不适用' : ' · 待改造'}
                    </View>
                ))}
            </View>
            <View className="preview-footer">
                预览直接使用打包后的 animal-island-ui/taro。
                <View />
                浏览器展示 H5 效果；微信键盘、安全区与手势仍需真机验收。
            </View>
            <Drawer
                open={drawer}
                title="登岛前的小贴士"
                onClose={() => setDrawer(false)}
                footer={
                    <Button type="primary" onClick={() => setDrawer(false)}>
                        我知道了
                    </Button>
                }
            >
                <View className="stack">
                    <View className="card-copy">
                        抽屉内部可以滚动，底部按钮始终可见。点击遮罩或右上角关闭，背景位置会保留。
                    </View>
                    <Button onClick={() => setNested(true)}>再打开一层抽屉</Button>
                    <Input ariaLabel="抽屉内输入" aria-label="抽屉内输入" placeholder="在这里试试键盘" allowClear />
                    {Array.from({ length: 8 }, (_, i) => (
                        <Card key={i} type="dashed">
                            <View className="card-title">小岛日常 {String(i + 1).padStart(2, '0')}</View>
                            <View className="card-copy">
                                散步、看海、和邻居打个招呼。试着滚动看看底部是否还有内容。
                            </View>
                        </Card>
                    ))}
                </View>
                <Drawer
                    open={nested && drawer}
                    title="这是第二层"
                    onClose={() => setNested(false)}
                    footer={
                        <Button type="primary" onClick={() => setNested(false)}>
                            返回第一层
                        </Button>
                    }
                >
                    <View className="card-copy">关闭这一层，第一层依然留在原处。</View>
                </Drawer>
            </Drawer>
        </View>
    );
}
