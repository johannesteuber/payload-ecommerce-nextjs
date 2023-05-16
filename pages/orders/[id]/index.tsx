import React, { useEffect, useState } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Button } from '../../../components/Button'
import { Gutter } from '../../../components/Gutter'
import { Media } from '../../../components/Media'
import { getApolloClient } from '../../../graphql'
import { HEADER_QUERY } from '../../../graphql/globals'
import { Order as OrderType } from '../../../payload-types'
import { useAuth } from '../../../providers/Auth'

import classes from './index.module.scss'

const Order: React.FC = () => {
  const [error] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const router = useRouter()
  const { query } = router
  const [order, setOrder] = useState<OrderType>()
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    setLoading(true)

    if (user && query.id) {
      // no real need to add a 'where' query here since the access control is handled by the API
      const fetchOrder = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/orders/${query.id}`, {
          credentials: 'include',
        })

        if (response.ok) {
          const json = await response.json()
          setOrder(json)
        }

        setLoading(false)
      }
      fetchOrder()
    }
  }, [user, query])

  useEffect(() => {
    const newTotal =
      order &&
      order.items.reduce((acc, item) => {
        return acc + (typeof item.product === 'object' ? item.product.price * item.quantity : 0)
      }, 0)
    setTotal(newTotal)
  }, [order])

  useEffect(() => {
    if (user === null) {
      router.push(`/login?unauthorized=account`)
    }
  }, [user, router])

  return (
    <Gutter className={classes.orders}>
      <h1>Order</h1>
      <p>{`Order ID: ${query.id}`}</p>
      {error && <div className={classes.error}>{error}</div>}
      {loading && <div className={classes.loading}>{`Loading order ${query.id}...`}</div>}
      {order && (
        <div className={classes.order}>
          <h4 className={classes.orderTitle}>Items</h4>
          {order.items?.map((item, index) => {
            let product

            if (typeof item.product === 'object') {
              product = item.product
            }

            const isLast = index === order.items.length - 1

            return (
              <ul className={classes.itemsList} key={index}>
                <li className={classes.item}>
                  <div className={classes.row}>
                    <div className={classes.mediaWrapper}>
                      {!product.meta.image && <span className={classes.placeholder}>No image</span>}
                      {product.meta.image && typeof product.meta.image !== 'string' && (
                        <Media imgClassName={classes.image} resource={product.meta.image} fill />
                      )}
                    </div>
                    <div className={classes.rowContent}>
                      <Link href={`/products/${product.slug}`}>
                        <h6 className={classes.title}>{product.title}</h6>
                      </Link>
                      <div>{`Quantity ${item.quantity}`}</div>
                      <div>
                        {/* TODO: get actual price */}
                        {`Price: ${(product.price / 100).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}`}
                      </div>
                    </div>
                  </div>
                  {!isLast && <hr className={classes.rowHR} />}
                </li>
              </ul>
            )
          })}
        </div>
      )}
      <h4>
        {/* TODO: get actual price */}
        {`Order Total: ${(total / 100).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}`}
      </h4>
      <br />
      <Button href="/orders" appearance="primary" label="See all orders" />
      <br />
      <br />
      <Button href="/account" appearance="secondary" label="Go to account" />
    </Gutter>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const apolloClient = getApolloClient()

  const { data } = await apolloClient.query({
    query: HEADER_QUERY,
  })

  return {
    props: {
      header: data?.Header || null,
      footer: data?.Footer || null,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  }
}

export default Order
