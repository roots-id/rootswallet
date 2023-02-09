//
//  RCTDIDCommModule.m
//  rootswallet
//
//  Created by Rodolfo Miranda on 1/28/23.
//

#import "RCTDIDCommModule.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>
//#import "rootswallet-Bridging-Header.h"
#import "rootswallet-Swift.h"

@implementation RCTDIDCommModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(unpack:(NSString *)packMsg
                  privateKey:(NSString *)privateKey
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
{
  [[PackUnpack new] unpack:packMsg privateKey:privateKey withResolver:resolve withRejecter:reject ];
};


RCT_EXPORT_METHOD(pack:(NSString *)body
                  id:(NSString *)id
                  thid:(NSString *)thid
                  to:(NSString *)to
                  from:(NSString *)from
                  messageType:(NSString *)messageType
                  customHeaders:(NSDictionary *)customHeaders
                  privateKey:(NSString *)privateKey
                  signFrom:(BOOL *)signFrom
                  protectSender:(BOOL *)protectSender
                  attachments:(NSArray *)attachments
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
{
  [[PackUnpack new] packEncrypted:body id:id thid:thid to:to from:from messageType:messageType customHeaders:customHeaders privateKey:privateKey signFrom:signFrom protectSender:protectSender attachments:attachments withResolver:resolve withRejecter:reject ];
};


@end
