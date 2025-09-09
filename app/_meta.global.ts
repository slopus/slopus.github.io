import { MetaRecord } from "nextra";


const meta = {
    index: {
        type: 'page',
        display: 'hidden'
    },
    docs: {
        type: 'page',
        title: 'Docs',
        // items: {
        //     index: ''
        // },
        items: {
            "index": "Welcome",
            "quick-start": "Quick Start",
            "how-it-works": "How It Works",
            "guides": "Guides",
            'faq': 'FAQ',
            'features': 'Features',
            //'contributing': 'Contributing'
            'comparisons': 'Comparisons',
            'use-cases': {
                //collapsed: true,
                //type: 'page',
                
            },
        }
    },
    tools: {
        type: 'page',
        title: 'Tools',
        href: '/tools/'
    },
    webapp: {
        href: 'https://app.happy.engineering',
        title: 'Web App',
        // display: 'hidden'
    }
}

export default meta;